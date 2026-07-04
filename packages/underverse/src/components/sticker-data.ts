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
      { id: "excited", name: "Excited Dog", animation: "bounce" },
      { id: "sad", name: "Sad Dog", animation: "wiggle" },
      { id: "cool", name: "Cool Dog", animation: "pulse" },
      { id: "angry", name: "Angry Dog", animation: "shake" },
      { id: "sleeping", name: "Sleeping Dog", animation: "pulse" },
      { id: "heart_eyes", name: "Heart Eyes Dog", animation: "pulse" },
      { id: "crying", name: "Crying Dog", animation: "wiggle" },
      { id: "thumbs_up", name: "Thumbs Up Dog", animation: "bounce" },
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
  {
    id: "pikalong_dragon",
    name: "Pikalong Cute Dragon",
    thumbnail: "hello",
    stickers: [
      { id: "hello", name: "Pikalong Hello", animation: "wiggle" },
      { id: "love", name: "Pikalong Love", animation: "pulse" },
      { id: "sad", name: "Pikalong Sad", animation: "bounce" },
      { id: "excited", name: "Pikalong Excited", animation: "pop" },
    ],
  },
  {
    id: "qoobee_dragon",
    name: "QooBee Agapi",
    thumbnail: "smile",
    stickers: [
      { id: "smile", name: "QooBee Smile", animation: "bounce" },
      { id: "giggle", name: "QooBee Giggle", animation: "wiggle" },
      { id: "sad", name: "QooBee Sad", animation: "pulse" },
      { id: "coffee", name: "QooBee Coffee", animation: "pop" },
    ],
  },
  {
    id: "ami_cat",
    name: "Ami Fat Cat",
    thumbnail: "hello",
    stickers: [
      { id: "hello", name: "Ami Hello", animation: "wiggle" },
      { id: "love", name: "Ami Love", animation: "pulse" },
      { id: "cry", name: "Ami Cry", animation: "bounce" },
      { id: "excited", name: "Ami Excited", animation: "pop" },
    ],
  },
  {
    id: "brown_bear",
    name: "Chubby Brown Bear",
    thumbnail: "hello",
    stickers: [
      { id: "hello", name: "Bear Hello", animation: "wiggle" },
      { id: "love", name: "Bear Love", animation: "pulse" },
      { id: "sad", name: "Bear Sad", animation: "bounce" },
      { id: "excited", name: "Bear Excited", animation: "pop" },
    ],
  },
  {
    id: "pepe_frog",
    name: "Pepe Frog",
    thumbnail: "smile",
    stickers: [
      { id: "smile", name: "Pepe Smile", animation: "wiggle" },
      { id: "cry", name: "Pepe Cry", animation: "bounce" },
      { id: "angry", name: "Pepe Angry", animation: "shake" },
      { id: "cool", name: "Pepe Cool", animation: "pop" },
    ],
  },
  {
    id: "mochi_cat",
    name: "Mochi Peach Cat",
    thumbnail: "hello",
    stickers: [
      { id: "hello", name: "Mochi Hello", animation: "wiggle" },
      { id: "love", name: "Mochi Love", animation: "pulse" },
      { id: "sad", name: "Mochi Sad", animation: "bounce" },
      { id: "excited", name: "Mochi Excited", animation: "pop" },
    ],
  },
  {
    id: "db_super",
    name: "Dragon Ball Super",
    thumbnail: "goku_hello",
    stickers: [
      { id: "goku_hello", name: "Goku Hello", animation: "wiggle" },
      { id: "vegeta_angry", name: "Vegeta Angry", animation: "shake" },
      { id: "goku_kame", name: "Goku Kamehameha", animation: "pulse" },
      { id: "buu_eat", name: "Majin Buu Eating", animation: "bounce" },
    ],
  },
  {
    id: "db_epic",
    name: "Dragon Ball Legend",
    thumbnail: "goku_ui",
    stickers: [
      { id: "goku_ui", name: "Goku UI", animation: "pulse" },
      { id: "vegeta_ue", name: "Vegeta UE", animation: "shake" },
      { id: "beerus", name: "Beerus Destruction", animation: "pop" },
      { id: "gogeta_blue", name: "Gogeta Blue", animation: "bounce" },
    ],
  },
  {
    id: "db_goku",
    name: "Goku (Dragon Ball)",
    thumbnail: "hello",
    stickers: [
      { id: "hello", name: "Goku Hello", animation: "wiggle" },
      { id: "thumbs_up", name: "Goku Thumbs Up", animation: "bounce" },
      { id: "kame", name: "Goku Kamehameha", animation: "pulse" },
      { id: "ui_glare", name: "Goku Ultra Instinct", animation: "pulse" },
      { id: "angry", name: "Goku Angry", animation: "shake" },
      { id: "eating", name: "Goku Eating", animation: "bounce" },
      { id: "exhausted", name: "Goku Exhausted", animation: "wiggle" },
      { id: "instant_transmission", name: "Instant Transmission", animation: "pop" },
      { id: "spirit_bomb", name: "Spirit Bomb", animation: "pulse" },
      { id: "laughing", name: "Goku Laughing", animation: "bounce" },
    ],
  },
  {
    id: "db_vegeta",
    name: "Vegeta (Dragon Ball)",
    thumbnail: "thumbs_up",
    stickers: [
      { id: "smirk", name: "Vegeta Smirk", animation: "wiggle" },
      { id: "angry", name: "Vegeta Angry", animation: "shake" },
      { id: "ultra_ego", name: "Vegeta Ultra Ego", animation: "pulse" },
      { id: "final_flash", name: "Final Flash", animation: "pulse" },
      { id: "thumbs_up", name: "Vegeta Salute", animation: "bounce" },
      { id: "defeated", name: "Vegeta Defeated", animation: "wiggle" },
      { id: "shocked", name: "Vegeta Shocked", animation: "pop" },
      { id: "blushing", name: "Vegeta Blushing", animation: "wiggle" },
      { id: "glare", name: "Vegeta Glare", animation: "pulse" },
      { id: "charging", name: "Vegeta Charging", animation: "shake" },
    ],
  },
  {
    id: "db_beerus",
    name: "Beerus (Dragon Ball)",
    thumbnail: "smug",
    stickers: [
      { id: "yawn", name: "Beerus Yawn", animation: "wiggle" },
      { id: "ramen", name: "Beerus Eating Ramen", animation: "bounce" },
      { id: "hakai", name: "Beerus Hakai", animation: "pulse" },
      { id: "smug", name: "Beerus Smug", animation: "wiggle" },
      { id: "sleeping", name: "Beerus Sleeping", animation: "pulse" },
      { id: "angry", name: "Beerus Angry", animation: "shake" },
      { id: "shocked", name: "Beerus Shocked", animation: "pop" },
      { id: "bored", name: "Beerus Bored", animation: "wiggle" },
      { id: "eating_pudding", name: "Beerus Eating Pudding", animation: "bounce" },
      { id: "mocking", name: "Beerus Mocking", animation: "pop" },
    ],
  },
  {
    id: "db_goku_black",
    name: "Goku Black (Dragon Ball)",
    thumbnail: "tea",
    stickers: [
      { id: "tea", name: "Goku Black Tea", animation: "wiggle" },
      { id: "rose_blade", name: "Goku Black Rosé", animation: "pulse" },
      { id: "sinister_smile", name: "Sinister Smile", animation: "wiggle" },
      { id: "divine_wrath", name: "Divine Wrath", animation: "pulse" },
      { id: "angry", name: "Goku Black Angry", animation: "shake" },
      { id: "glare", name: "Goku Black Glare", animation: "pulse" },
      { id: "pain", name: "Goku Black Pain", animation: "wiggle" },
      { id: "cloning", name: "Goku Black Scythe", animation: "pop" },
      { id: "confident", name: "Goku Black Confident", animation: "bounce" },
      { id: "pointing", name: "Goku Black Pointing", animation: "pulse" },
    ],
  },
];



