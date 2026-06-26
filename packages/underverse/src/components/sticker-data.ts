export interface Sticker {
  id: string;
  name: string;
  ext?: string;
  animation?: "bounce" | "wiggle" | "spin" | "pulse" | "shake" | "pop";
}

export interface StickerPack {
  id: string;
  name: string;
  thumbnail: string; // The sticker id used as the pack's thumbnail/icon
  stickers: Sticker[];
}

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "memoji_apple",
    name: "Apple Memoji",
    thumbnail: "thumbs_up",
    stickers: [
      { id: "thumbs_up", name: "Thumbs Up" },
      { id: "heart_eyes", name: "Heart Eyes" },
      { id: "sunglasses", name: "Sunglasses" },
      { id: "mind_blown", name: "Mind Blown" },
    ],
  },
  {
    id: "boss",
    name: "Boss",
    thumbnail: "thumbs_up",
    stickers: [
      { id: "thumbs_up", name: "Thumbs Up", animation: "bounce" },
      { id: "heart_eyes", name: "Heart Eyes", animation: "pulse" },
      { id: "flower_face", name: "Flower Face", animation: "pop" },
      { id: "pensive", name: "Pensive", animation: "pulse" },
      { id: "big_belly", name: "Big Belly", animation: "bounce" },
      { id: "laughing", name: "Laughing", animation: "bounce" },
      { id: "surprised", name: "Surprised", animation: "pop" },
      { id: "waving", name: "Waving", animation: "wiggle" },
      { id: "angry", name: "Angry", animation: "shake" },
      { id: "crying", name: "Crying", animation: "wiggle" },
      { id: "ok_sign", name: "OK", animation: "bounce" },
      { id: "thinking", name: "Thinking", animation: "pulse" },
      { id: "working", name: "Working", animation: "wiggle" },
      { id: "cheers", name: "Cheers", animation: "bounce" },
      { id: "sleeping", name: "Sleeping", animation: "pulse" },
    ],
  },
  {
    id: "cute_cat",
    name: "Cute Cat",
    thumbnail: "wave",
    stickers: [
      { id: "wave", name: "Waving Cat", animation: "wiggle" },
      { id: "love", name: "Loving Cat", animation: "pulse" },
      { id: "cry", name: "Crying Cat", animation: "wiggle" },
      { id: "laugh", name: "Laughing Cat", animation: "bounce" },
      { id: "sleeping", name: "Sleeping Cat", animation: "pulse" },
      { id: "scared", name: "Scared Cat", animation: "pop" },
      { id: "heart_eyes", name: "Heart Eyes Cat", animation: "pulse" },
      { id: "thumbs_up", name: "Thumbs Up Cat", animation: "bounce" },
    ],
  },
  {
    id: "cute_dog",
    name: "Cute Dog",
    thumbnail: "excited",
    stickers: [
      { id: "excited", name: "Excited Dog" },
      { id: "sad", name: "Sad Dog" },
      { id: "cool", name: "Cool Dog" },
      { id: "angry", name: "Angry Dog" },
    ],
  },
  {
    id: "cool_monkey",
    name: "Cool Monkey",
    thumbnail: "excited",
    stickers: [
      { id: "see", name: "See No Evil" },
      { id: "hear", name: "Hear No Evil" },
      { id: "speak", name: "Speak No Evil" },
      { id: "excited", name: "Excited Monkey" },
    ],
  },
  {
    id: "cute_bunny",
    name: "Cute Bunny",
    thumbnail: "wink",
    stickers: [
      { id: "wink", name: "Winking Bunny" },
      { id: "shy", name: "Shy Bunny" },
      { id: "sleepy", name: "Sleepy Bunny" },
      { id: "heart", name: "Loving Bunny" },
    ],
  },
];
