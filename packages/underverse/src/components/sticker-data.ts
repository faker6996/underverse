export interface Sticker {
  id: string;
  name: string;
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
      { id: "flower_face", name: "Flower Face" },
      { id: "pensive", name: "Pensive" },
      { id: "big_belly", name: "Big Belly" },
      { id: "laughing", name: "Laughing" },
      { id: "surprised", name: "Surprised" },
    ],
  },
  {
    id: "cute_cat",
    name: "Cute Cat",
    thumbnail: "wave",
    stickers: [
      { id: "wave", name: "Waving Cat" },
      { id: "love", name: "Loving Cat" },
      { id: "cry", name: "Crying Cat" },
      { id: "laugh", name: "Laughing Cat" },
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
