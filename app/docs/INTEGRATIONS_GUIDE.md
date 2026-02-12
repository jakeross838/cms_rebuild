# RossOS Integrations Guide

> Comprehensive guide for third-party integrations including e-signature, calendar, accounting, and communication services.

## Table of Contents

1. [Integration Architecture](#integration-architecture)
2. [E-Signature Integration](#e-signature-integration)
3. [Calendar Sync](#calendar-sync)
4. [Accounting Integration](#accounting-integration)
5. [SMS & Communication](#sms--communication)
6. [Payment Processing](#payment-processing)
7. [Cloud Storage](#cloud-storage)
8. [Webhook Management](#webhook-management)

---

## Integration Architecture

### Database Schema

```sql
-- Integration connections per company
CREATE TABLE integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'quickbooks', 'docusign', 'google_calendar', etc.
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'connected', 'error', 'disconnected'

  -- OAuth tokens (encrypted)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Provider-specific data
  external_account_id VARCHAR(255),
  external_account_name VARCHAR(255),
  metadata JSONB DEFAULT '{}',

  -- Sync settings
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, provider)
);

-- Sync history for auditing
CREATE TABLE integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,

  sync_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'webhook'
  direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound', 'bidirectional'

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,

  status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
  error_details JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity mappings between RossOS and external systems
CREATE TABLE integration_entity_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,

  entity_type VARCHAR(50) NOT NULL, -- 'client', 'vendor', 'invoice', 'job', etc.
  internal_id UUID NOT NULL,
  external_id VARCHAR(255) NOT NULL,

  last_synced_at TIMESTAMPTZ,
  sync_hash VARCHAR(64), -- Hash of synced data to detect changes

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(connection_id, entity_type, internal_id),
  UNIQUE(connection_id, entity_type, external_id)
);

-- RLS Policies
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_entity_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON integration_connections
  USING (company_id = get_current_company_id());
CREATE POLICY "tenant_isolation" ON integration_sync_logs
  USING (company_id = get_current_company_id());
CREATE POLICY "tenant_isolation" ON integration_entity_mappings
  USING (company_id = get_current_company_id());
```

### Integration Service Base Class

```typescript
// src/lib/integrations/base.ts
import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/crypto';

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface SyncResult {
  processed: number;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ record: string; error: string }>;
}

export abstract class IntegrationService {
  protected provider: string;
  protected companyId: string;
  protected connection: any;

  constructor(provider: string, companyId: string) {
    this.provider = provider;
    this.companyId = companyId;
  }

  // OAuth flow
  abstract getAuthorizationUrl(redirectUri: string, state: string): string;
  abstract exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens>;
  abstract refreshAccessToken(refreshToken: string): Promise<OAuthTokens>;

  // Connection management
  async connect(tokens: OAuthTokens, accountInfo: any): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('integration_connections')
      .upsert({
        company_id: this.companyId,
        provider: this.provider,
        status: 'connected',
        access_token_encrypted: encrypt(tokens.accessToken),
        refresh_token_encrypted: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
        token_expires_at: tokens.expiresAt?.toISOString(),
        external_account_id: accountInfo.id,
        external_account_name: accountInfo.name,
        metadata: accountInfo.metadata || {},
      }, {
        onConflict: 'company_id,provider',
      });

    if (error) throw error;
  }

  async disconnect(): Promise<void> {
    const supabase = await createClient();

    await supabase
      .from('integration_connections')
      .update({
        status: 'disconnected',
        access_token_encrypted: null,
        refresh_token_encrypted: null,
        sync_enabled: false,
      })
      .eq('company_id', this.companyId)
      .eq('provider', this.provider);
  }

  async getConnection(): Promise<any> {
    if (this.connection) return this.connection;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('company_id', this.companyId)
      .eq('provider', this.provider)
      .single();

    if (error || !data) return null;

    this.connection = {
      ...data,
      accessToken: data.access_token_encrypted ? decrypt(data.access_token_encrypted) : null,
      refreshToken: data.refresh_token_encrypted ? decrypt(data.refresh_token_encrypted) : null,
    };

    return this.connection;
  }

  protected async ensureValidToken(): Promise<string> {
    const connection = await this.getConnection();
    if (!connection) throw new Error('Not connected');

    // Check if token is expired (with 5-minute buffer)
    const expiresAt = new Date(connection.token_expires_at);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);

    if (expiresAt < now && connection.refreshToken) {
      const newTokens = await this.refreshAccessToken(connection.refreshToken);
      await this.updateTokens(newTokens);
      return newTokens.accessToken;
    }

    return connection.accessToken;
  }

  private async updateTokens(tokens: OAuthTokens): Promise<void> {
    const supabase = await createClient();

    await supabase
      .from('integration_connections')
      .update({
        access_token_encrypted: encrypt(tokens.accessToken),
        refresh_token_encrypted: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
        token_expires_at: tokens.expiresAt?.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', this.companyId)
      .eq('provider', this.provider);

    // Clear cached connection
    this.connection = null;
  }

  // Sync logging
  protected async logSync(
    syncType: string,
    direction: string,
    result: SyncResult
  ): Promise<void> {
    const supabase = await createClient();
    const connection = await this.getConnection();

    await supabase.from('integration_sync_logs').insert({
      company_id: this.companyId,
      connection_id: connection.id,
      sync_type: syncType,
      direction,
      completed_at: new Date().toISOString(),
      records_processed: result.processed,
      records_created: result.created,
      records_updated: result.updated,
      records_failed: result.failed,
      status: result.failed > 0 ? 'completed_with_errors' : 'completed',
      error_details: result.errors.length > 0 ? result.errors : null,
    });

    // Update last sync timestamp
    await supabase
      .from('integration_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connection.id);
  }

  // Entity mapping
  protected async getMapping(
    entityType: string,
    internalId: string
  ): Promise<string | null> {
    const supabase = await createClient();
    const connection = await this.getConnection();

    const { data } = await supabase
      .from('integration_entity_mappings')
      .select('external_id')
      .eq('connection_id', connection.id)
      .eq('entity_type', entityType)
      .eq('internal_id', internalId)
      .single();

    return data?.external_id || null;
  }

  protected async createMapping(
    entityType: string,
    internalId: string,
    externalId: string
  ): Promise<void> {
    const supabase = await createClient();
    const connection = await this.getConnection();

    await supabase.from('integration_entity_mappings').upsert({
      company_id: this.companyId,
      connection_id: connection.id,
      entity_type: entityType,
      internal_id: internalId,
      external_id: externalId,
      last_synced_at: new Date().toISOString(),
    });
  }
}
```

---

## E-Signature Integration

### Supported Providers
- **DocuSign** (Primary)
- **HelloSign/Dropbox Sign** (Alternative)
- **Adobe Sign** (Enterprise)

### DocuSign Integration

```typescript
// src/lib/integrations/docusign.ts
import { IntegrationService, OAuthTokens, SyncResult } from './base';

const DOCUSIGN_AUTH_URL = 'https://account-d.docusign.com/oauth/auth'; // Demo
const DOCUSIGN_TOKEN_URL = 'https://account-d.docusign.com/oauth/token';
const DOCUSIGN_API_URL = 'https://demo.docusign.net/restapi';

interface EnvelopeOptions {
  templateId?: string;
  subject: string;
  message?: string;
  signers: Array<{
    email: string;
    name: string;
    routingOrder?: number;
    tabs?: any;
  }>;
  documents?: Array<{
    name: string;
    content: Buffer;
    fileExtension: string;
  }>;
  webhookUrl?: string;
}

export class DocuSignService extends IntegrationService {
  constructor(companyId: string) {
    super('docusign', companyId);
  }

  getAuthorizationUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      scope: 'signature impersonation',
      client_id: process.env.DOCUSIGN_CLIENT_ID!,
      redirect_uri: redirectUri,
      state,
    });
    return `${DOCUSIGN_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens> {
    const response = await fetch(DOCUSIGN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.DOCUSIGN_CLIENT_ID}:${process.env.DOCUSIGN_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const response = await fetch(DOCUSIGN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.DOCUSIGN_CLIENT_ID}:${process.env.DOCUSIGN_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async getAccountInfo(): Promise<{ id: string; name: string; baseUri: string }> {
    const token = await this.ensureValidToken();

    const response = await fetch(`${DOCUSIGN_AUTH_URL.replace('/auth', '/userinfo')}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    const account = data.accounts[0]; // Use default account

    return {
      id: account.account_id,
      name: account.account_name,
      baseUri: account.base_uri,
    };
  }

  /**
   * Send a document for signature
   */
  async sendForSignature(options: EnvelopeOptions): Promise<string> {
    const token = await this.ensureValidToken();
    const connection = await this.getConnection();
    const accountId = connection.external_account_id;
    const baseUri = connection.metadata.baseUri || DOCUSIGN_API_URL;

    const envelope: any = {
      emailSubject: options.subject,
      emailBlurb: options.message,
      status: 'sent',
      recipients: {
        signers: options.signers.map((signer, index) => ({
          email: signer.email,
          name: signer.name,
          recipientId: String(index + 1),
          routingOrder: signer.routingOrder || index + 1,
          tabs: signer.tabs,
        })),
      },
    };

    // Use template or custom documents
    if (options.templateId) {
      envelope.templateId = options.templateId;
    } else if (options.documents) {
      envelope.documents = options.documents.map((doc, index) => ({
        documentId: String(index + 1),
        name: doc.name,
        fileExtension: doc.fileExtension,
        documentBase64: doc.content.toString('base64'),
      }));
    }

    // Set up webhook for status updates
    if (options.webhookUrl) {
      envelope.eventNotification = {
        url: options.webhookUrl,
        loggingEnabled: true,
        requireAcknowledgment: true,
        envelopeEvents: [
          { envelopeEventStatusCode: 'sent' },
          { envelopeEventStatusCode: 'delivered' },
          { envelopeEventStatusCode: 'completed' },
          { envelopeEventStatusCode: 'declined' },
          { envelopeEventStatusCode: 'voided' },
        ],
        recipientEvents: [
          { recipientEventStatusCode: 'Sent' },
          { recipientEventStatusCode: 'Delivered' },
          { recipientEventStatusCode: 'Completed' },
          { recipientEventStatusCode: 'Declined' },
        ],
      };
    }

    const response = await fetch(
      `${baseUri}/v2.1/accounts/${accountId}/envelopes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envelope),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send envelope');
    }

    return result.envelopeId;
  }

  /**
   * Get envelope status
   */
  async getEnvelopeStatus(envelopeId: string): Promise<{
    status: string;
    sentDateTime: string;
    completedDateTime?: string;
    recipients: any[];
  }> {
    const token = await this.ensureValidToken();
    const connection = await this.getConnection();
    const accountId = connection.external_account_id;
    const baseUri = connection.metadata.baseUri || DOCUSIGN_API_URL;

    const response = await fetch(
      `${baseUri}/v2.1/accounts/${accountId}/envelopes/${envelopeId}?include=recipients`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.json();
  }

  /**
   * Download signed document
   */
  async downloadSignedDocument(envelopeId: string): Promise<Buffer> {
    const token = await this.ensureValidToken();
    const connection = await this.getConnection();
    const accountId = connection.external_account_id;
    const baseUri = connection.metadata.baseUri || DOCUSIGN_API_URL;

    const response = await fetch(
      `${baseUri}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/combined`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * List available templates
   */
  async listTemplates(): Promise<Array<{ id: string; name: string }>> {
    const token = await this.ensureValidToken();
    const connection = await this.getConnection();
    const accountId = connection.external_account_id;
    const baseUri = connection.metadata.baseUri || DOCUSIGN_API_URL;

    const response = await fetch(
      `${baseUri}/v2.1/accounts/${accountId}/templates`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    return data.envelopeTemplates?.map((t: any) => ({
      id: t.templateId,
      name: t.name,
    })) || [];
  }
}
```

### E-Signature API Routes

```typescript
// src/app/api/integrations/docusign/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DocuSignService } from '@/lib/integrations/docusign';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { companyId, documentType, documentId, signers, subject, message } = await request.json();

  try {
    const docusign = new DocuSignService(companyId);

    // Get document to sign based on type
    let document: { name: string; content: Buffer; fileExtension: string };

    switch (documentType) {
      case 'contract':
        document = await generateContractPDF(documentId);
        break;
      case 'change_order':
        document = await generateChangeOrderPDF(documentId);
        break;
      case 'proposal':
        document = await generateProposalPDF(documentId);
        break;
      default:
        throw new Error('Unknown document type');
    }

    const envelopeId = await docusign.sendForSignature({
      subject,
      message,
      signers,
      documents: [document],
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/docusign`,
    });

    // Store envelope reference
    await supabase.from('esign_envelopes').insert({
      company_id: companyId,
      envelope_id: envelopeId,
      document_type: documentType,
      document_id: documentId,
      status: 'sent',
      signers: signers,
      sent_by: user.id,
    });

    return NextResponse.json({ envelopeId });
  } catch (error) {
    console.error('DocuSign send error:', error);
    return NextResponse.json(
      { error: 'Failed to send for signature' },
      { status: 500 }
    );
  }
}
```

### E-Signature Webhook Handler

```typescript
// src/app/api/webhooks/docusign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('X-DocuSign-Signature-1');

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.DOCUSIGN_WEBHOOK_SECRET!)
    .update(body)
    .digest('base64');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const envelopeId = event.data?.envelopeId;
  const status = event.data?.envelopeSummary?.status;

  const supabase = createServiceClient();

  // Update envelope status
  const { data: envelope } = await supabase
    .from('esign_envelopes')
    .update({
      status: status.toLowerCase(),
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      metadata: event.data?.envelopeSummary,
    })
    .eq('envelope_id', envelopeId)
    .select()
    .single();

  if (envelope && status === 'completed') {
    // Download and store signed document
    const docusign = new DocuSignService(envelope.company_id);
    const signedPdf = await docusign.downloadSignedDocument(envelopeId);

    // Store in Supabase Storage
    await supabase.storage
      .from('signed-documents')
      .upload(
        `${envelope.company_id}/${envelope.document_type}/${envelope.document_id}/signed.pdf`,
        signedPdf,
        { contentType: 'application/pdf' }
      );

    // Update original document as signed
    await updateDocumentAsSigned(
      envelope.document_type,
      envelope.document_id,
      envelopeId
    );
  }

  return NextResponse.json({ received: true });
}
```

---

## Calendar Sync

### Supported Providers
- **Google Calendar**
- **Microsoft Outlook/365**

### Google Calendar Integration

```typescript
// src/lib/integrations/google-calendar.ts
import { IntegrationService, OAuthTokens } from './base';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export class GoogleCalendarService extends IntegrationService {
  private oauth2Client: any;

  constructor(companyId: string) {
    super('google_calendar', companyId);
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`
    );
  }

  getAuthorizationUrl(redirectUri: string, state: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state,
      prompt: 'consent', // Force refresh token
    });
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);

    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || refreshToken,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
    };
  }

  private async getCalendarClient() {
    const token = await this.ensureValidToken();
    const connection = await this.getConnection();

    this.oauth2Client.setCredentials({
      access_token: token,
      refresh_token: connection.refreshToken,
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Create calendar event from RossOS schedule item
   */
  async createEvent(scheduleItem: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    attendees?: string[];
  }): Promise<string> {
    const calendar = await this.getCalendarClient();

    const event = {
      summary: scheduleItem.title,
      description: scheduleItem.description,
      location: scheduleItem.location,
      start: {
        dateTime: scheduleItem.startDate.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: scheduleItem.endDate.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: scheduleItem.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
    });

    return response.data.id!;
  }

  /**
   * Update existing calendar event
   */
  async updateEvent(eventId: string, updates: Partial<{
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
  }>): Promise<void> {
    const calendar = await this.getCalendarClient();

    const event: any = {};
    if (updates.title) event.summary = updates.title;
    if (updates.description) event.description = updates.description;
    if (updates.location) event.location = updates.location;
    if (updates.startDate) {
      event.start = {
        dateTime: updates.startDate.toISOString(),
        timeZone: 'America/New_York',
      };
    }
    if (updates.endDate) {
      event.end = {
        dateTime: updates.endDate.toISOString(),
        timeZone: 'America/New_York',
      };
    }

    await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: event,
      sendUpdates: 'all',
    });
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    const calendar = await this.getCalendarClient();

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
  }

  /**
   * Sync schedule items to calendar
   */
  async syncScheduleToCalendar(jobId: string): Promise<SyncResult> {
    const supabase = await createClient();
    const result: SyncResult = {
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    // Get schedule items for job
    const { data: scheduleItems } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('job_id', jobId)
      .eq('sync_to_calendar', true);

    for (const item of scheduleItems || []) {
      result.processed++;

      try {
        const existingEventId = await this.getMapping('schedule_item', item.id);

        if (existingEventId) {
          await this.updateEvent(existingEventId, {
            title: item.title,
            description: item.description,
            startDate: new Date(item.start_date),
            endDate: new Date(item.end_date),
          });
          result.updated++;
        } else {
          const eventId = await this.createEvent({
            title: item.title,
            description: item.description,
            startDate: new Date(item.start_date),
            endDate: new Date(item.end_date),
          });
          await this.createMapping('schedule_item', item.id, eventId);
          result.created++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          record: item.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await this.logSync('incremental', 'outbound', result);
    return result;
  }
}
```

---

## Accounting Integration

### Supported Providers
- **QuickBooks Online** (Primary)
- **Xero** (Alternative)
- **Sage** (Enterprise)

### QuickBooks Integration

```typescript
// src/lib/integrations/quickbooks.ts
import { IntegrationService, OAuthTokens, SyncResult } from './base';
import OAuthClient from 'intuit-oauth';

export class QuickBooksService extends IntegrationService {
  private oauthClient: OAuthClient;

  constructor(companyId: string) {
    super('quickbooks', companyId);
    this.oauthClient = new OAuthClient({
      clientId: process.env.QUICKBOOKS_CLIENT_ID!,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/quickbooks/callback`,
    });
  }

  getAuthorizationUrl(redirectUri: string, state: string): string {
    return this.oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state,
    });
  }

  async exchangeCodeForTokens(code: string, realmId: string): Promise<OAuthTokens> {
    const authResponse = await this.oauthClient.createToken(code);
    const tokens = authResponse.getJson();

    // Store realmId (company ID in QuickBooks)
    this.oauthClient.setToken(tokens);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    this.oauthClient.setToken({ refresh_token: refreshToken });
    const authResponse = await this.oauthClient.refresh();
    const tokens = authResponse.getJson();

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = await this.ensureValidToken();
    const connection = await this.getConnection();
    const realmId = connection.external_account_id;
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const response = await fetch(`${baseUrl}/v3/company/${realmId}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.Fault?.Error?.[0]?.Detail || 'QuickBooks API error');
    }

    return response.json();
  }

  /**
   * Sync clients to QuickBooks customers
   */
  async syncClients(): Promise<SyncResult> {
    const supabase = await createClient();
    const result: SyncResult = {
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', this.companyId);

    for (const client of clients || []) {
      result.processed++;

      try {
        const existingQbId = await this.getMapping('client', client.id);

        const customerData = {
          DisplayName: client.company_name || `${client.first_name} ${client.last_name}`,
          GivenName: client.first_name,
          FamilyName: client.last_name,
          PrimaryEmailAddr: client.email ? { Address: client.email } : undefined,
          PrimaryPhone: client.phone ? { FreeFormNumber: client.phone } : undefined,
          BillAddr: client.billing_address ? {
            Line1: client.billing_address.street,
            City: client.billing_address.city,
            CountrySubDivisionCode: client.billing_address.state,
            PostalCode: client.billing_address.zip,
          } : undefined,
        };

        if (existingQbId) {
          // Get current SyncToken for update
          const existing = await this.makeRequest(`/customer/${existingQbId}`);
          const response = await this.makeRequest('/customer', {
            method: 'POST',
            body: JSON.stringify({
              ...customerData,
              Id: existingQbId,
              SyncToken: existing.Customer.SyncToken,
            }),
          });
          result.updated++;
        } else {
          const response = await this.makeRequest('/customer', {
            method: 'POST',
            body: JSON.stringify(customerData),
          });
          await this.createMapping('client', client.id, response.Customer.Id);
          result.created++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          record: client.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await this.logSync('full', 'outbound', result);
    return result;
  }

  /**
   * Sync vendors to QuickBooks vendors
   */
  async syncVendors(): Promise<SyncResult> {
    const supabase = await createClient();
    const result: SyncResult = {
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    const { data: vendors } = await supabase
      .from('vendors')
      .select('*')
      .eq('company_id', this.companyId);

    for (const vendor of vendors || []) {
      result.processed++;

      try {
        const existingQbId = await this.getMapping('vendor', vendor.id);

        const vendorData = {
          DisplayName: vendor.company_name,
          GivenName: vendor.contact_first_name,
          FamilyName: vendor.contact_last_name,
          PrimaryEmailAddr: vendor.email ? { Address: vendor.email } : undefined,
          PrimaryPhone: vendor.phone ? { FreeFormNumber: vendor.phone } : undefined,
          TaxIdentifier: vendor.tax_id,
        };

        if (existingQbId) {
          const existing = await this.makeRequest(`/vendor/${existingQbId}`);
          await this.makeRequest('/vendor', {
            method: 'POST',
            body: JSON.stringify({
              ...vendorData,
              Id: existingQbId,
              SyncToken: existing.Vendor.SyncToken,
            }),
          });
          result.updated++;
        } else {
          const response = await this.makeRequest('/vendor', {
            method: 'POST',
            body: JSON.stringify(vendorData),
          });
          await this.createMapping('vendor', vendor.id, response.Vendor.Id);
          result.created++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          record: vendor.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await this.logSync('full', 'outbound', result);
    return result;
  }

  /**
   * Create invoice in QuickBooks
   */
  async createInvoice(invoiceId: string): Promise<string> {
    const supabase = await createClient();

    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        job:jobs(*),
        line_items:invoice_line_items(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (!invoice) throw new Error('Invoice not found');

    // Get or create customer mapping
    let customerId = await this.getMapping('client', invoice.client_id);
    if (!customerId) {
      await this.syncClients();
      customerId = await this.getMapping('client', invoice.client_id);
    }

    const invoiceData = {
      CustomerRef: { value: customerId },
      TxnDate: invoice.invoice_date,
      DueDate: invoice.due_date,
      PrivateNote: `Job: ${invoice.job?.name || 'N/A'}`,
      Line: invoice.line_items.map((item: any, index: number) => ({
        Id: String(index + 1),
        LineNum: index + 1,
        Amount: item.amount,
        Description: item.description,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          Qty: item.quantity,
          UnitPrice: item.unit_price,
        },
      })),
    };

    const response = await this.makeRequest('/invoice', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });

    const qbInvoiceId = response.Invoice.Id;
    await this.createMapping('invoice', invoiceId, qbInvoiceId);

    // Update invoice with QB reference
    await supabase
      .from('invoices')
      .update({
        external_id: qbInvoiceId,
        synced_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    return qbInvoiceId;
  }

  /**
   * Sync payment from QuickBooks
   */
  async importPayments(since?: Date): Promise<SyncResult> {
    const result: SyncResult = {
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    // Query payments from QuickBooks
    const query = since
      ? `SELECT * FROM Payment WHERE MetaData.LastUpdatedTime > '${since.toISOString()}'`
      : `SELECT * FROM Payment`;

    const response = await this.makeRequest(
      `/query?query=${encodeURIComponent(query)}`
    );

    const supabase = await createClient();

    for (const payment of response.QueryResponse?.Payment || []) {
      result.processed++;

      try {
        // Find linked invoice
        const invoiceRef = payment.Line?.[0]?.LinkedTxn?.[0];
        if (!invoiceRef) continue;

        const { data: mapping } = await supabase
          .from('integration_entity_mappings')
          .select('internal_id')
          .eq('connection_id', (await this.getConnection()).id)
          .eq('entity_type', 'invoice')
          .eq('external_id', invoiceRef.TxnId)
          .single();

        if (!mapping) continue;

        // Record payment
        await supabase.from('payments').upsert({
          company_id: this.companyId,
          invoice_id: mapping.internal_id,
          amount: payment.TotalAmt,
          payment_date: payment.TxnDate,
          payment_method: payment.PaymentMethodRef?.name || 'Other',
          reference_number: payment.PaymentRefNum,
          external_id: payment.Id,
        }, {
          onConflict: 'company_id,external_id',
        });

        result.created++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          record: payment.Id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await this.logSync('incremental', 'inbound', result);
    return result;
  }

  /**
   * Get chart of accounts for cost code mapping
   */
  async getAccounts(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    accountNumber?: string;
  }>> {
    const response = await this.makeRequest(
      '/query?query=' + encodeURIComponent('SELECT * FROM Account WHERE Active = true')
    );

    return (response.QueryResponse?.Account || []).map((account: any) => ({
      id: account.Id,
      name: account.Name,
      type: account.AccountType,
      accountNumber: account.AcctNum,
    }));
  }
}
```

### Accounting Sync Settings UI

```typescript
// src/components/integrations/QuickBooksSettings.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface QuickBooksSettingsProps {
  connection: {
    id: string;
    status: string;
    external_account_name: string;
    last_sync_at: string;
    metadata: {
      syncSettings?: {
        autoSyncClients: boolean;
        autoSyncVendors: boolean;
        autoSyncInvoices: boolean;
        importPayments: boolean;
      };
    };
  };
}

export function QuickBooksSettings({ connection }: QuickBooksSettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(connection.metadata.syncSettings || {
    autoSyncClients: true,
    autoSyncVendors: true,
    autoSyncInvoices: true,
    importPayments: true,
  });
  const [syncing, setSyncing] = useState(false);

  const handleSync = async (type: 'clients' | 'vendors' | 'invoices') => {
    setSyncing(true);
    try {
      const response = await fetch(`/api/integrations/quickbooks/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const result = await response.json();

      toast({
        title: 'Sync Complete',
        description: `Processed: ${result.processed}, Created: ${result.created}, Updated: ${result.updated}`,
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'An error occurred during sync',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect QuickBooks?')) return;

    await fetch(`/api/integrations/quickbooks/disconnect`, {
      method: 'POST',
    });

    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>QuickBooks Online</span>
          <span className="text-sm font-normal text-green-600">
            Connected to {connection.external_account_name}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sync Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Auto-Sync Settings</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-clients">Sync Clients → Customers</Label>
            <Switch
              id="sync-clients"
              checked={settings.autoSyncClients}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoSyncClients: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-vendors">Sync Vendors</Label>
            <Switch
              id="sync-vendors"
              checked={settings.autoSyncVendors}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoSyncVendors: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sync-invoices">Sync Invoices</Label>
            <Switch
              id="sync-invoices"
              checked={settings.autoSyncInvoices}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoSyncInvoices: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="import-payments">Import Payments</Label>
            <Switch
              id="import-payments"
              checked={settings.importPayments}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, importPayments: checked })
              }
            />
          </div>
        </div>

        {/* Manual Sync Buttons */}
        <div className="space-y-2">
          <h4 className="font-medium">Manual Sync</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSync('clients')}
              disabled={syncing}
            >
              Sync Clients
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSync('vendors')}
              disabled={syncing}
            >
              Sync Vendors
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSync('invoices')}
              disabled={syncing}
            >
              Sync Invoices
            </Button>
          </div>
        </div>

        {/* Last Sync Info */}
        <div className="text-sm text-muted-foreground">
          Last synced: {connection.last_sync_at
            ? new Date(connection.last_sync_at).toLocaleString()
            : 'Never'}
        </div>

        {/* Disconnect */}
        <Button variant="destructive" onClick={handleDisconnect}>
          Disconnect QuickBooks
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## SMS & Communication

### Twilio Integration

```typescript
// src/lib/integrations/twilio.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface SMSMessage {
  to: string;
  body: string;
  mediaUrl?: string[];
}

export const TwilioService = {
  /**
   * Send SMS message
   */
  async sendSMS(message: SMSMessage): Promise<string> {
    const result = await client.messages.create({
      to: message.to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message.body,
      mediaUrl: message.mediaUrl,
    });

    return result.sid;
  },

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(messages: SMSMessage[]): Promise<string[]> {
    const results = await Promise.allSettled(
      messages.map(msg => this.sendSMS(msg))
    );

    return results.map((result, index) =>
      result.status === 'fulfilled' ? result.value : `failed:${index}`
    );
  },

  /**
   * Send schedule reminder
   */
  async sendScheduleReminder(
    phoneNumber: string,
    jobName: string,
    taskName: string,
    date: Date
  ): Promise<string> {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return this.sendSMS({
      to: phoneNumber,
      body: `Reminder: ${taskName} scheduled for ${formattedDate} on ${jobName}. - RossOS`,
    });
  },

  /**
   * Send daily log notification to client
   */
  async sendDailyLogNotification(
    phoneNumber: string,
    jobName: string,
    logDate: Date,
    summary: string,
    photoCount: number
  ): Promise<string> {
    const formattedDate = logDate.toLocaleDateString();
    let body = `Daily Update - ${jobName} (${formattedDate})\n\n${summary}`;

    if (photoCount > 0) {
      body += `\n\n${photoCount} photos added. View in your client portal.`;
    }

    return this.sendSMS({
      to: phoneNumber,
      body,
    });
  },

  /**
   * Send selection deadline reminder
   */
  async sendSelectionReminder(
    phoneNumber: string,
    clientName: string,
    selectionName: string,
    dueDate: Date
  ): Promise<string> {
    const daysUntil = Math.ceil(
      (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return this.sendSMS({
      to: phoneNumber,
      body: `Hi ${clientName}, your selection "${selectionName}" is due in ${daysUntil} days. Please make your choice in the client portal. - RossOS`,
    });
  },
};
```

### Webhook Handler for Incoming SMS

```typescript
// src/app/api/webhooks/twilio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const body = await request.formData();
  const signature = request.headers.get('X-Twilio-Signature') || '';

  // Verify webhook signature
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`;
  const params: Record<string, string> = {};
  body.forEach((value, key) => {
    params[key] = value.toString();
  });

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const from = params.From;
  const messageBody = params.Body;
  const mediaUrls = [];

  // Collect any media attachments
  const numMedia = parseInt(params.NumMedia || '0');
  for (let i = 0; i < numMedia; i++) {
    mediaUrls.push(params[`MediaUrl${i}`]);
  }

  const supabase = createServiceClient();

  // Find user by phone number
  const { data: user } = await supabase
    .from('users')
    .select('id, company_id')
    .eq('phone', from)
    .single();

  if (user) {
    // Store incoming message
    await supabase.from('sms_messages').insert({
      company_id: user.company_id,
      user_id: user.id,
      direction: 'inbound',
      phone_number: from,
      body: messageBody,
      media_urls: mediaUrls.length > 0 ? mediaUrls : null,
      received_at: new Date().toISOString(),
    });

    // Check for command keywords
    const command = messageBody.trim().toUpperCase();

    if (command === 'STOP') {
      await supabase
        .from('users')
        .update({ sms_opt_out: true })
        .eq('id', user.id);
    } else if (command === 'START') {
      await supabase
        .from('users')
        .update({ sms_opt_out: false })
        .eq('id', user.id);
    }
  }

  // Return TwiML response
  const twiml = new twilio.twiml.MessagingResponse();
  // Optionally add auto-reply
  // twiml.message('Thanks for your message!');

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
```

---

## Payment Processing

### Stripe Integration

```typescript
// src/lib/integrations/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const StripeService = {
  /**
   * Create customer for client
   */
  async createCustomer(client: {
    email: string;
    name: string;
    companyId: string;
    clientId: string;
  }): Promise<string> {
    const customer = await stripe.customers.create({
      email: client.email,
      name: client.name,
      metadata: {
        company_id: client.companyId,
        client_id: client.clientId,
      },
    });

    return customer.id;
  },

  /**
   * Create payment intent for invoice
   */
  async createPaymentIntent(params: {
    amount: number; // in cents
    customerId: string;
    invoiceId: string;
    companyId: string;
    description: string;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: 'usd',
      customer: params.customerId,
      description: params.description,
      metadata: {
        company_id: params.companyId,
        invoice_id: params.invoiceId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  },

  /**
   * Create setup intent for saving payment method
   */
  async createSetupIntent(customerId: string): Promise<string> {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card', 'us_bank_account'],
    });

    return setupIntent.client_secret!;
  },

  /**
   * Charge saved payment method
   */
  async chargePaymentMethod(params: {
    customerId: string;
    paymentMethodId: string;
    amount: number;
    invoiceId: string;
    companyId: string;
  }): Promise<string> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: 'usd',
      customer: params.customerId,
      payment_method: params.paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        company_id: params.companyId,
        invoice_id: params.invoiceId,
      },
    });

    return paymentIntent.id;
  },

  /**
   * Get customer payment methods
   */
  async getPaymentMethods(customerId: string): Promise<Array<{
    id: string;
    type: string;
    card?: { brand: string; last4: string; expMonth: number; expYear: number };
    bankAccount?: { bankName: string; last4: string };
  }>> {
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    const bankMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'us_bank_account',
    });

    return [
      ...methods.data.map(m => ({
        id: m.id,
        type: 'card',
        card: m.card ? {
          brand: m.card.brand,
          last4: m.card.last4,
          expMonth: m.card.exp_month,
          expYear: m.card.exp_year,
        } : undefined,
      })),
      ...bankMethods.data.map(m => ({
        id: m.id,
        type: 'bank_account',
        bankAccount: m.us_bank_account ? {
          bankName: m.us_bank_account.bank_name || 'Bank Account',
          last4: m.us_bank_account.last4 || '****',
        } : undefined,
      })),
    ];
  },

  /**
   * Create connected account for company (for marketplace payouts)
   */
  async createConnectedAccount(company: {
    id: string;
    name: string;
    email: string;
  }): Promise<string> {
    const account = await stripe.accounts.create({
      type: 'standard',
      email: company.email,
      metadata: {
        company_id: company.id,
      },
      business_profile: {
        name: company.name,
      },
    });

    return account.id;
  },

  /**
   * Create account link for onboarding
   */
  async createAccountLink(accountId: string, returnUrl: string): Promise<string> {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: returnUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return link.url;
  },
};
```

### Stripe Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata.invoice_id;
      const companyId = paymentIntent.metadata.company_id;

      if (invoiceId) {
        // Record payment
        await supabase.from('payments').insert({
          company_id: companyId,
          invoice_id: invoiceId,
          amount: paymentIntent.amount / 100, // Convert from cents
          payment_method: 'stripe',
          stripe_payment_intent_id: paymentIntent.id,
          status: 'completed',
          paid_at: new Date().toISOString(),
        });

        // Update invoice status
        const { data: invoice } = await supabase
          .from('invoices')
          .select('amount_due, amount_paid')
          .eq('id', invoiceId)
          .single();

        if (invoice) {
          const newAmountPaid = (invoice.amount_paid || 0) + paymentIntent.amount / 100;
          const status = newAmountPaid >= invoice.amount_due ? 'paid' : 'partial';

          await supabase
            .from('invoices')
            .update({
              amount_paid: newAmountPaid,
              status,
              paid_at: status === 'paid' ? new Date().toISOString() : null,
            })
            .eq('id', invoiceId);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata.invoice_id;
      const companyId = paymentIntent.metadata.company_id;

      if (invoiceId) {
        await supabase.from('payments').insert({
          company_id: companyId,
          invoice_id: invoiceId,
          amount: paymentIntent.amount / 100,
          payment_method: 'stripe',
          stripe_payment_intent_id: paymentIntent.id,
          status: 'failed',
          error_message: paymentIntent.last_payment_error?.message,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

---

## Cloud Storage

### Google Drive Integration

```typescript
// src/lib/integrations/google-drive.ts
import { IntegrationService, OAuthTokens } from './base';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export class GoogleDriveService extends IntegrationService {
  private oauth2Client: any;

  constructor(companyId: string) {
    super('google_drive', companyId);
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-drive/callback`
    );
  }

  getAuthorizationUrl(redirectUri: string, state: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state,
      prompt: 'consent',
    });
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || refreshToken,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
    };
  }

  private async getDriveClient() {
    const token = await this.ensureValidToken();
    const connection = await this.getConnection();

    this.oauth2Client.setCredentials({
      access_token: token,
      refresh_token: connection.refreshToken,
    });

    return google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Create folder for job
   */
  async createJobFolder(jobName: string, parentFolderId?: string): Promise<string> {
    const drive = await this.getDriveClient();

    const response = await drive.files.create({
      requestBody: {
        name: jobName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      },
      fields: 'id',
    });

    return response.data.id!;
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(params: {
    name: string;
    content: Buffer;
    mimeType: string;
    folderId: string;
  }): Promise<string> {
    const drive = await this.getDriveClient();
    const { Readable } = await import('stream');

    const response = await drive.files.create({
      requestBody: {
        name: params.name,
        parents: [params.folderId],
      },
      media: {
        mimeType: params.mimeType,
        body: Readable.from(params.content),
      },
      fields: 'id, webViewLink',
    });

    return response.data.webViewLink!;
  }

  /**
   * Share folder with client
   */
  async shareFolder(folderId: string, email: string, role: 'reader' | 'writer' = 'reader'): Promise<void> {
    const drive = await this.getDriveClient();

    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: 'user',
        role,
        emailAddress: email,
      },
      sendNotificationEmail: true,
    });
  }
}
```

---

## Webhook Management

### Webhook Configuration UI

```typescript
// src/app/(dashboard)/settings/integrations/webhooks/page.tsx
import { createClient } from '@/lib/supabase/server';
import { WebhookList } from '@/components/integrations/WebhookList';

export default async function WebhooksPage() {
  const supabase = await createClient();

  const { data: webhooks } = await supabase
    .from('outgoing_webhooks')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Outgoing Webhooks</h1>
        <p className="text-muted-foreground">
          Send real-time notifications to external systems when events occur in RossOS.
        </p>
      </div>

      <WebhookList webhooks={webhooks || []} />
    </div>
  );
}
```

### Webhook Dispatcher

```typescript
// src/lib/webhooks/dispatcher.ts
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';

export type WebhookEvent =
  | 'job.created'
  | 'job.updated'
  | 'invoice.created'
  | 'invoice.paid'
  | 'change_order.approved'
  | 'daily_log.created'
  | 'selection.made'
  | 'document.uploaded';

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
}

export async function dispatchWebhook(
  companyId: string,
  event: WebhookEvent,
  data: any
): Promise<void> {
  const supabase = createServiceClient();

  // Get active webhooks for this event
  const { data: webhooks } = await supabase
    .from('outgoing_webhooks')
    .select('*')
    .eq('company_id', companyId)
    .eq('active', true)
    .contains('events', [event]);

  if (!webhooks?.length) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  // Send to all matching webhooks
  await Promise.allSettled(
    webhooks.map(webhook => sendWebhook(webhook, payload))
  );
}

async function sendWebhook(webhook: any, payload: WebhookPayload): Promise<void> {
  const supabase = createServiceClient();
  const body = JSON.stringify(payload);

  // Generate signature
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex');

  const startTime = Date.now();
  let response: Response;
  let error: string | null = null;

  try {
    response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp,
      },
      body,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      error = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
    response = { ok: false, status: 0 } as Response;
  }

  const duration = Date.now() - startTime;

  // Log delivery attempt
  await supabase.from('webhook_deliveries').insert({
    webhook_id: webhook.id,
    company_id: webhook.company_id,
    event: payload.event,
    payload,
    status_code: response.status,
    success: response.ok,
    error,
    duration_ms: duration,
  });

  // Update webhook stats
  await supabase
    .from('outgoing_webhooks')
    .update({
      last_triggered_at: new Date().toISOString(),
      consecutive_failures: response.ok ? 0 : (webhook.consecutive_failures || 0) + 1,
    })
    .eq('id', webhook.id);

  // Disable webhook after too many failures
  if (!response.ok && (webhook.consecutive_failures || 0) >= 9) {
    await supabase
      .from('outgoing_webhooks')
      .update({ active: false, disabled_reason: 'Too many consecutive failures' })
      .eq('id', webhook.id);
  }
}
```

---

## Environment Variables

```bash
# .env.local

# DocuSign
DOCUSIGN_CLIENT_ID=your_client_id
DOCUSIGN_CLIENT_SECRET=your_client_secret
DOCUSIGN_WEBHOOK_SECRET=your_webhook_secret

# Google (Calendar, Drive)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# QuickBooks
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Encryption key for tokens
ENCRYPTION_KEY=your_32_byte_key_here
```

---

## Summary

| Integration | Purpose | Sync Direction |
|-------------|---------|----------------|
| DocuSign | E-signatures for contracts, COs | Bidirectional |
| Google Calendar | Schedule sync | Outbound |
| QuickBooks | Accounting sync | Bidirectional |
| Twilio | SMS notifications | Bidirectional |
| Stripe | Payment processing | Inbound |
| Google Drive | Document storage | Outbound |

All integrations use OAuth 2.0 for secure authentication and store encrypted tokens in the database with automatic refresh handling.
