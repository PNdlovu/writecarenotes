import React from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { HandoverNote } from '../../types/handover'

interface HandoverNotesProps {
  sessionId: string
  notes: HandoverNote[]
  onAddNote: (note: Omit<HandoverNote, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateNote: (noteId: string, content: string) => void
}

export const HandoverNotes: React.FC<HandoverNotesProps> = ({
  sessionId,
  notes,
  onAddNote,
  onUpdateNote,
}) => {
  const { data: session } = useSession()
  const [newNote, setNewNote] = React.useState('')

  const handleAddNote = () => {
    if (!session?.user || !newNote.trim()) return

    onAddNote({
      handoverSessionId: sessionId,
      content: newNote,
      author: session.user,
      authorId: session.user.id,
      attachments: [],
    })
    setNewNote('')
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Textarea
          placeholder="Add a new note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={handleAddNote} disabled={!newNote.trim()}>
            Add Note
          </Button>
        </div>
      </Card>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={note.author.image || ''} />
                  <AvatarFallback>
                    {note.author.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{note.author.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {note.authorId === session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newContent = prompt('Edit note:', note.content)
                          if (newContent) {
                            onUpdateNote(note.id, newContent)
                          }
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">{note.content}</p>
                  {note.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Attachments:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {note.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            {attachment.filename}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
