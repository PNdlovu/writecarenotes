import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Form/input";
import { Badge } from "@/components/ui/Badge/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/Form/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Label } from "@/components/ui/Form/label";
import { Icons } from "@/components/ui/icons";

interface Memory {
  id: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  photos: string[];
  videos?: string[];
  tags: string[];
  addedBy: string;
  likes: string[];
  comments: Comment[];
  albumId?: string;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
}

interface Album {
  id: string;
  title: string;
  description: string;
  coverPhoto: string;
  createdAt: Date;
  createdBy: string;
  memories: string[];
}

interface MemoryAlbumProps {
  residentId: string;
  familyMemberId: string;
}

export const MemoryAlbum: React.FC<MemoryAlbumProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [activeTab, setActiveTab] = useState("timeline");
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Mock data - replace with actual API calls
  const memories: Memory[] = [
    {
      id: '1',
      title: 'Birthday Celebration',
      description: 'A wonderful 80th birthday celebration with family and friends',
      date: new Date('2024-01-15'),
      location: 'Family Home',
      photos: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg'
      ],
      tags: ['birthday', 'celebration', 'family'],
      addedBy: 'Jane Doe',
      likes: ['user1', 'user2'],
      comments: [
        {
          id: 'c1',
          authorId: 'user1',
          authorName: 'John Smith',
          content: 'Such a beautiful celebration!',
          timestamp: new Date('2024-01-15T15:30:00')
        }
      ]
    }
  ];

  const albums: Album[] = [
    {
      id: 'a1',
      title: 'Family Gatherings',
      description: 'Special moments with our loved ones',
      coverPhoto: 'https://example.com/cover1.jpg',
      createdAt: new Date('2024-01-01'),
      createdBy: 'Jane Doe',
      memories: ['1']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Memory Album</h2>
          <p className="text-muted-foreground">
            Cherish and share special moments together
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCreateAlbumOpen(true)}>
            <Icons.folderPlus className="mr-2 h-4 w-4" />
            New Album
          </Button>
          <Button onClick={() => setIsAddMemoryOpen(true)}>
            <Icons.plus className="mr-2 h-4 w-4" />
            Add Memory
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="map">Memory Map</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-6">
              {memories.map((memory) => (
                <Card key={memory.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{memory.title}</h3>
                        <p className="text-muted-foreground">
                          {memory.date.toLocaleDateString()} • {memory.location}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Icons.more className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Icons.edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Icons.album className="mr-2 h-4 w-4" />
                            Add to Album
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Icons.share className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Icons.trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p>{memory.description}</p>

                    <div className="grid grid-cols-2 gap-2">
                      {memory.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-video bg-muted rounded-lg overflow-hidden"
                        >
                          <img
                            src={photo}
                            alt={`Memory ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {memory.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        <Icons.heart className="mr-2 h-4 w-4" />
                        {memory.likes.length} Likes
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icons.messageCircle className="mr-2 h-4 w-4" />
                        {memory.comments.length} Comments
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {memory.comments.map((comment) => (
                        <div key={comment.id} className="bg-muted p-2 rounded-lg">
                          <div className="flex justify-between">
                            <p className="font-medium">{comment.authorName}</p>
                            <p className="text-sm text-muted-foreground">
                              {comment.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input placeholder="Add a comment..." className="flex-1" />
                      <Button>Post</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {albums.map((album) => (
              <Card key={album.id} className="overflow-hidden">
                <div
                  className="aspect-video bg-muted"
                  style={{
                    backgroundImage: `url(${album.coverPhoto})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="p-4">
                  <h3 className="font-semibold">{album.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {album.memories.length} memories
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    View Album
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map">
          {/* Memory Map implementation */}
        </TabsContent>

        <TabsContent value="favorites">
          {/* Favorite memories */}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddMemoryOpen} onOpenChange={setIsAddMemoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Memory</DialogTitle>
            <DialogDescription>
              Capture and share a special moment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input placeholder="Give your memory a title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Tell the story behind this memory" />
            </div>
            <div>
              <Label>Location</Label>
              <Input placeholder="Where did this memory take place?" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Tags</Label>
              <Input placeholder="Add tags (comma separated)" />
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Icons.upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2">Upload photos or videos</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop files or click to browse
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemoryOpen(false)}>
              Cancel
            </Button>
            <Button>Save Memory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateAlbumOpen} onOpenChange={setIsCreateAlbumOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Album</DialogTitle>
            <DialogDescription>
              Organize your memories into a collection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Album Title</Label>
              <Input placeholder="Give your album a name" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Describe what this album is about" />
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Icons.image className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2">Choose a cover photo</p>
              <p className="text-sm text-muted-foreground">
                Select a photo to represent this album
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateAlbumOpen(false)}>
              Cancel
            </Button>
            <Button>Create Album</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


