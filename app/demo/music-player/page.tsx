import MusicPlayer from "@/components/ui/MusicPlayer";

export default function MusicPlayerDemo() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Music Player Demo 🎵</h1>

        {/* Default Music Player */}
        <MusicPlayer />

        {/* Instructions */}
        <div className="mt-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">📝 Hướng dẫn sử dụng:</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Component đã được tạo với 20 bài hát mặc định</li>
            <li>
              📁 Thêm file nhạc .mp3 vào: <code className="bg-black bg-opacity-30 px-2 py-1 rounded">public/music/</code>
            </li>
            <li>🎨 Giao diện gradient đẹp với animation mượt mà</li>
            <li>⚙️ Các tính năng: Play/Pause, Next/Previous, Volume, Seek, Playlist</li>
            <li>📱 Responsive và hỗ trợ cả mobile</li>
          </ul>

          <div className="mt-4 p-4 bg-yellow-500 bg-opacity-20 rounded-lg border border-yellow-500">
            <p className="text-sm">
              ⚠️ <strong>Lưu ý bản quyền:</strong> Chỉ sử dụng nhạc bạn có quyền. Xem <code>public/music/README.md</code> để biết nguồn nhạc miễn phí.
            </p>
          </div>
        </div>

        {/* Example Code */}
        <div className="mt-6 bg-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">💻 Cách sử dụng:</h3>
          <pre className="text-green-400 text-sm overflow-x-auto">
            {`import MusicPlayer from '@/components/ui/MusicPlayer';

// Sử dụng playlist mặc định
<MusicPlayer />

// Hoặc truyền playlist riêng
const myPlaylist = [
  {
    id: 1,
    title: 'My Song',
    artist: 'Artist Name',
    duration: '3:30',
    audioUrl: '/music/my-song.mp3'
  },
];

<MusicPlayer 
  playlist={myPlaylist}
  autoPlay={false}
  showPlaylist={true}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
