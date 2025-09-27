
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
import { Loader2, Send } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp, doc } from 'firebase/firestore';

interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: { [key: string]: string };
  participantAvatars: { [key: string]: string };
  lastMessageText: string;
  lastMessageTimestamp: Timestamp;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

interface TenantUser {
  id: string;
  name: string;
}

export default function CommunicationPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const tenantId = 'acme-tutoring';
  const teacherAvatar = PlaceHolderImages.find((p) => p.id === 'avatar-2');

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const conversationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `tenants/${tenantId}/conversations`),
      where('participantIds', 'array-contains', user.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );
  }, [firestore, user, tenantId]);

  const { data: conversations, isLoading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedConversation) return null;
    return query(
      collection(firestore, `tenants/${tenantId}/conversations/${selectedConversation.id}/messages`),
      orderBy('timestamp', 'asc')
    );
  }, [firestore, selectedConversation]);

  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };
  
  const getAvatarUrl = (avatarId: string | undefined) => {
    return PlaceHolderImages.find((p) => p.id === avatarId)?.imageUrl || '';
  }
  
  const getOtherParticipant = (convo: Conversation) => {
    const otherId = convo.participantIds.find(id => id !== user?.uid) || '';
    return {
      id: otherId,
      name: convo.participantNames[otherId] || 'Unknown',
      avatar: convo.participantAvatars[otherId] || ''
    }
  }

  const renderConversationList = () => {
    if (conversationsLoading) {
      return <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
    }
    if (!conversations || conversations.length === 0) {
      return <div className="text-center text-muted-foreground p-4">No conversations found.</div>
    }
    return (
       <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="space-y-2">
            {conversations.map((convo) => {
              const otherParticipant = getOtherParticipant(convo);
              const avatarUrl = getAvatarUrl(otherParticipant.avatar);
              return (
                <button
                  key={convo.id}
                  onClick={() => handleSelectConversation(convo)}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg w-full text-left transition-colors',
                    selectedConversation?.id === convo.id
                      ? 'bg-muted'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <Avatar className="h-10 w-10">
                    {avatarUrl && <AvatarImage src={avatarUrl} />}
                    <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="font-semibold">{otherParticipant.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {convo.lastMessageText}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground self-start">
                    {convo.lastMessageTimestamp?.toDate().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
    )
  }

  const renderChatWindow = () => {
    if (!selectedConversation) {
      return <div className="flex items-center justify-center h-full text-muted-foreground">Select a conversation to start chatting.</div>
    }

    const otherParticipant = getOtherParticipant(selectedConversation);
    const otherParticipantAvatarUrl = getAvatarUrl(otherParticipant.avatar);
    const teacherAvatarUrl = getAvatarUrl(teacherAvatar?.id);

    return (
      <div className="col-span-2 flex flex-col h-[calc(100vh-18rem)]">
        <div className="border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold">{otherParticipant.name}</h3>
        </div>
        <ScrollArea className="flex-1 mb-4">
          {messagesLoading ? (
             <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
          ) : (
            <div className="space-y-4 pr-4">
              {messages?.map((msg, index) => {
                const isTeacher = msg.senderId === user?.uid;
                const avatarUrl = isTeacher ? teacherAvatarUrl : otherParticipantAvatarUrl;
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
                          {avatarUrl && <AvatarImage src={avatarUrl} />}
                          <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
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
                          {avatarUrl && <AvatarImage src={avatarUrl} />}
                          <AvatarFallback>Y</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="mt-auto flex gap-2">
          <Input placeholder="Type your message..." className="flex-1" disabled />
          <Button disabled>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    )
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
            {renderConversationList()}
          </div>

          {/* Chat Window */}
          {renderChatWindow()}
        </div>
      </CardContent>
    </Card>
  );
}
