"use client";

import React from "react";
import { useTranslations } from "next-intl";
import MusicPlayer, { Song } from "@/components/ui/MusicPlayer";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function MusicPlayerExample() {
  const t = useTranslations("DocsUnderverse");

  // Custom playlist example
  const customPlaylist: Song[] = [
    {
      id: 1,
      title: "Sample Song 1",
      artist: "Artist Name",
      duration: "3:45",
      audioUrl: "/music/sample-1.mp3",
    },
    {
      id: 2,
      title: "Sample Song 2",
      artist: "Another Artist",
      duration: "4:20",
      audioUrl: "/music/sample-2.mp3",
    },
  ];

  const demo = (
    <div className="space-y-8">
      {/* Default Music Player */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Default Music Player</p>
        <MusicPlayer />
      </div>
    </div>
  );

  const usage = `import MusicPlayer from '@/components/ui/MusicPlayer';

export function Example() {
  return <MusicPlayer />;
}`;

  const customPlaylistCode = `import MusicPlayer, { Song } from '@/components/ui/MusicPlayer';

const myPlaylist: Song[] = [
  {
    id: 1,
    title: 'My Song',
    artist: 'Artist Name',
    duration: '3:30',
    audioUrl: '/music/my-song.mp3'
  },
  {
    id: 2,
    title: 'Another Song',
    artist: 'Another Artist',
    duration: '4:15',
    audioUrl: '/music/another-song.mp3'
  }
];

export function CustomPlaylistExample() {
  return (
    <MusicPlayer 
      playlist={myPlaylist}
      autoPlay={false}
      showPlaylist={true}
      className="max-w-2xl"
    />
  );
}`;

  const propsData: PropsRow[] = [
    {
      property: "playlist",
      type: "Song[]",
      default: "DEFAULT_PLAYLIST (30 songs)",
      description: "Array of songs to play. Each song must have id, title, duration, and audioUrl. Artist, startTime, endTime are optional.",
    },
    {
      property: "autoPlay",
      type: "boolean",
      default: "false",
      description: "Whether to automatically start playing when component mounts. May be blocked by browser autoplay policies.",
    },
    {
      property: "showPlaylist",
      type: "boolean",
      default: "true",
      description: "Whether to show the playlist by default. Users can toggle it using the playlist button.",
    },
    {
      property: "className",
      type: "string",
      default: '""',
      description: "Additional CSS classes to apply to the container.",
    },
  ];

  const songPropsData: PropsRow[] = [
    {
      property: "id",
      type: "number",
      default: "required",
      description: "Unique identifier for the song.",
    },
    {
      property: "title",
      type: "string",
      default: "required",
      description: "Song title.",
    },
    {
      property: "artist",
      type: "string?",
      default: "undefined",
      description: "Artist or performer name (optional).",
    },
    {
      property: "duration",
      type: "string",
      default: "required",
      description: "Song duration in format 'M:SS' (e.g., '3:45').",
    },
    {
      property: "audioUrl",
      type: "string",
      default: "required",
      description: "Path to the audio file (relative to public/ or absolute URL).",
    },
    {
      property: "startTime",
      type: "number?",
      default: "undefined",
      description: "Start timestamp in seconds for long audio files with multiple songs.",
    },
    {
      property: "endTime",
      type: "number?",
      default: "undefined",
      description: "End timestamp in seconds for long audio files with multiple songs.",
    },
  ];

  const tabs = [
    {
      value: "preview",
      label: t("preview"),
      content: demo,
    },
    {
      value: "code",
      label: t("code"),
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Basic Usage</p>
            <CodeBlock code={usage} />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Custom Playlist</p>
            <CodeBlock code={customPlaylistCode} />
          </div>
        </div>
      ),
    },
    {
      value: "props",
      label: t("propsTab"),
      content: (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-3">MusicPlayerProps</p>
            <PropsDocsTable rows={propsData} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Song Interface</p>
            <PropsDocsTable rows={songPropsData} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Tabs tabs={tabs} />
    </div>
  );
}
