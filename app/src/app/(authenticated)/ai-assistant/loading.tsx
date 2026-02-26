export default function AiAssistantLoading(): React.ReactElement {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading ai assistant...</p>
      </div>
    </div>
  )
}
