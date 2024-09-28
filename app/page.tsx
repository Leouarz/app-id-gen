'use client';

import React, { useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { CreateAppId } from '@/components/CreateAppId';
import { SearchAppIds } from '@/components/SearchAppIds';

export default function Home() {
  const [tab, setTab] = useState('create');

  return (
    <main className="flex-grow container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-center text-xl font-bold">
        Welcome to the Avail App management
      </h1>
      <h1 className="text-center mb-6 text-xl font-bold">
        This is an app to create and search information about Avail application IDs
      </h1>
      <Tabs value={tab} onValueChange={setTab} className="w-full max-w-lg mt-12">
        <TabsList className="mb-4 flex justify-center">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CreateAppId />
        </TabsContent>
        <TabsContent value="search">
          <SearchAppIds />
        </TabsContent>
      </Tabs>
    </main>
  );
}
