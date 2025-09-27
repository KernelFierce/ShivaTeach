
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const mockConversations = [
  {
    id: '1',
    name: 'Alex Johnson (Student)',
    lastMessage: "Thanks for the help with the algebra homework! I finally get it.",
    time: '2:45 PM',
    avatarId: 'student-avatar',
    unread: 0,
  },
  {
    id: '2',
    name: 'Carol Johnson (Parent)',
    lastMessage: "Just wanted to confirm Alex's session time for next week.",
    time: '11:15 AM',
    avatarId: 'avatar-3', 
    unread: 2,
  },
  {
    id: '3',
    name: 'Sarah Lee (Student)',
    lastMessage: 'Can we review the chemistry lab report?',
    time: 'Yesterday',
    avatarId: 'avatar-1',
    unread: 0,
  },
];

const mockMessages = {
  '1': [
    { from: 'student', text: "Hi Mr. Chen, I'm having trouble with question 5 on the homework.", time: '1:30 PM' },
    { from: 'teacher', text: 'Hi Alex. No problem. Can you show me what you have so far?', time: '1:32 PM' },
    { from: 'student', text: 'I tried to solve for x but I keep getting a negative number.', time: '1:35 PM' },
    { from: 'teacher', text: 'Ah, I see. Remember to distribute the negative sign to both terms inside the parentheses. That\'s a common mistake.', time: '1:40 PM' },
    { from: 'student', text: "Oh, that's what I was missing! Thanks for the help with the algebra homework! I finally get it.", time: '1:42 PM' },
  ],
  '2': [
    { from: 'parent', text: "Hello David, this is Carol Johnson.", time: '11:14 AM' },
    { from: 'parent', text: "Just wanted to confirm Alex's session time for next week.", time: '11:15 AM' },
  ],
  '3': [
     { from: 'student', text: 'Can we review the chemistry lab report?', time: 'Yesterday' },
  ]
};

type Message = { from: 'teacher' | 'student' | 'parent'; text: string; time: string };

export default function CommunicationPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages['1']);
  const teacherAvatar = PlaceHolderImages.find((p) => p.id === 'avatar-2');

  const handleSelectConversation = (conversation: typeof mockConversations[0]) => {
    setSelectedConversation(conversation);
    setMessages(mockMessages[conversation.id as keyof typeof mockMessages] || []);
  };

  const getAvatar = (id: string) => {
    return PlaceHolderImages.find((p) => p.id === id);
  }

  return (
    <Card className="h-[calc(100vh-10rem)]">
      <CardHeader>
        <CardTitle className="font-headline">Communication</CardTitle>
        <CardDescription>
          Message with students and parents. All communications are logged.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Conversation List */}
          <div className="col-span-1 border-r pr-4">
            <h3 className="text-lg font-semibold mb-4 px-2">Conversations</h3>
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-2">
                {mockConversations.map((convo) => {
                  const avatar = getAvatar(convo.avatarId);
                  return (
                    <button
                      key={convo.id}
                      onClick={() => handleSelectConversation(convo)}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg w-full text-left transition-colors',
                        selectedConversation.id === convo.id
                          ? 'bg-muted'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        {avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} />}
                        <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 truncate">
                        <p className="font-semibold">{convo.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {convo.lastMessage}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground self-start">
                        {convo.time}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className="col-span-2 flex flex-col h-[calc(100vh-18rem)]">
            <div className="border-b pb-2 mb-4">
                 <h3 className="text-lg font-semibold">{selectedConversation.name}</h3>
            </div>
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4 pr-4">
                {messages.map((msg, index) => {
                  const isTeacher = msg.from === 'teacher';
                  const avatar = isTeacher ? teacherAvatar : getAvatar(selectedConversation.avatarId);
                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex items-end gap-2',
                        isTeacher ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {!isTeacher && (
                         <Avatar className="h-8 w-8">
                            {avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} />}
                            <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'p-3 rounded-lg max-w-xs lg:max-w-md',
                          isTeacher
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                       {isTeacher && (
                         <Avatar className="h-8 w-8">
                            {avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} />}
                            <AvatarFallback>Y</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="mt-auto flex gap-2">
              <Input placeholder="Type your message..." className="flex-1" />
              <Button>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
