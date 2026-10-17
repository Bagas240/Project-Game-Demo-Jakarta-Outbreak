import { CharacterProfile, DialogueLine } from '../types/game';

export const CHARACTER_PROFILES: CharacterProfile[] = [
  {
    id: 'dika',
    name: 'Dika Pratama',
    role: 'Protagonis · Siswa Kelas XII IPA 2',
    description: 'Siswa SMA yang berani dan tenang di bawah tekanan. Berangkat dari rumah di pagi hari tanpa menyadari bahwa hari itu adalah hari terakhir kehidupannya yang normal di Jakarta.',
    status: 'alive',
    portraitColor: '#2563eb',
    schoolUniform: 'Seragam Putih Abu-abu, Ransel Navy, Mistar Besi Penggaris',
  },
  {
    id: 'lia',
    name: 'Lia Anggraini',
    role: 'Anggota PMR · Sahabat Masa Kecil',
    description: 'Siswi cerdas dan tanggap. Membawa kotak obat P3K sekolah untuk merawat luka teman-temannya selama wabah melanda.',
    status: 'alive',
    portraitColor: '#059669',
    schoolUniform: 'Seragam Putih Abu-abu, Tas Medis PMR Palang Merah',
  },
  {
    id: 'rafli',
    name: 'Rafli Maulana',
    role: 'Atlet Olahraga Sekolah',
    description: 'Fisik atletis dan berjiwa pelindung. Selalu berdiri di barisan pelindung saat teman-temannya terdesak di lorong sekolah.',
    status: 'alive',
    portraitColor: '#d97706',
    schoolUniform: 'Jaket Varsity Jingga, Seragam Putih Abu-abu',
  },
  {
    id: 'farel',
    name: 'Farel Adrian',
    role: 'Ketua Tim Robotik Sekolah',
    description: 'Kutu buku berkacamata yang setia kawan. Pengetahuannya tentang denah sekolah menyelamatkan tim dari jalan buntu.',
    status: 'alive',
    portraitColor: '#7c3aed',
    schoolUniform: 'Seragam Putih Abu-abu, Kacamata, Catatan & Senter',
  },
  {
    id: 'dafa',
    name: 'Dafa Arya (Pahlawan)',
    role: 'Sahabat Terbaik Dika · In Memoriam',
    description: 'Sahabat terbaik Dika yang setia dan penuh tawa. Mengorbankan nyawanya menahan pintu lorong gerbang utama agar Dika dan kawan-kawan bisa lolos dari kepungan zombie.',
    status: 'deceased',
    portraitColor: '#dc2626',
    schoolUniform: 'Ikat Kepala Merah Putih, Seragam Putih Abu-abu',
  },
];

export const CHAPTER_DIALOGUES: Record<string, DialogueLine[]> = {
  // 1. Depan Rumah Dika
  ch_house: [
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'Bu! Dika berangkat sekolah dulu ya! Jam segini jalanan Jakarta biasanya mulai ramai.',
      voicePitch: 1.0,
      emotion: 'normal',
    },
    {
      speaker: 'Ibu Dika',
      portrait: 'ibu',
      text: '(Suara dari dalam rumah) Iya Dika, hati-hati di jalan ya le. Uang saku ada di meja. Jangan lupa berdoa, dari tadi berita di TV banyak kabar aneh tentang orang histeris di stasiun...',
      voicePitch: 1.3,
      emotion: 'normal',
    },
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'Siap Bu! Dika jalan kaki lewat gang dekat warung ya!',
      voicePitch: 1.0,
      emotion: 'normal',
    },
  ],

  // 2. Perjalanan di Gang Jakarta
  ch_walk: [
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'Suasana gang pagi ini tumben sepi banget... Warung biasanya ramai orang ngopi, tapi sekarang pintu-pintunya tertutup rapat.',
      voicePitch: 1.0,
      emotion: 'normal',
    },
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'Dari arah jalan raya Sudirman juga terdengar bunyi sirine ambulans dan helikopter terus-terusan... Ada apa sebenarnya di Jakarta?',
      voicePitch: 0.95,
      emotion: 'shock',
    },
  ],

  // 3. Gerbang SMA 03 Jakarta
  ch_school_gate: [
    {
      speaker: 'Dafa',
      portrait: 'dafa',
      text: 'Oi Dika! Akhirnya nongol juga lo! Tuh gerobak batagor Mang Ujang baunya sedap banget, ntar jam istirahat serbu bareng yok!',
      voicePitch: 1.1,
      emotion: 'normal',
    },
    {
      speaker: 'Lia',
      portrait: 'lia',
      text: 'Dafa, jangan mikirin makanan terus deh. Sebentar lagi bel masuk, Pak Budi udah siap-siap mau ngajar Fisika di kelas XII IPA 2!',
      voicePitch: 1.3,
      emotion: 'normal',
    },
    {
      speaker: 'Rafli',
      portrait: 'rafli',
      text: 'Bener kata Lia. Gerbang sekolah udah mau dikunci sama Pak Satpam. Ayo buruan masuk!',
      voicePitch: 0.9,
      emotion: 'normal',
    },
    {
      speaker: 'Farel',
      portrait: 'farel',
      text: 'Kalian ngerasa nggak sih, suasana kota hari ini mencekam banget... Di Twitter pada rame video orang saling gigit di halte...',
      voicePitch: 1.2,
      emotion: 'shock',
    },
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'Ayo masuk ke kelas XII IPA 2 dulu sebelum kita ditegur guru piket.',
      voicePitch: 1.0,
      emotion: 'normal',
    },
  ],

  // 4. Pembelajaran di Kelas XII IPA 2
  ch_classroom_study: [
    {
      speaker: 'Pak Budi',
      portrait: 'guru',
      text: 'Selamat siang anak-anak kelas XII IPA 2. Buka buku catatan kalian. Hari ini kita mendalami materi Gerak Lurus Beraturan di papan tulis...',
      voicePitch: 0.85,
      emotion: 'normal',
    },
    {
      speaker: 'Lia',
      portrait: 'lia',
      text: 'Pak Budi... maaf, di luar lapangan kok ada suara jeritan orang-orang ya?',
      voicePitch: 1.3,
      emotion: 'shock',
    },
    {
      speaker: 'Pak Budi',
      portrait: 'guru',
      text: 'Mungkin anak-anak ekskul di lapangan sedang latihan yel-yel. Tenang semuanya, 2 menit lagi jam 12:00 bel istirahat berbunyi...',
      voicePitch: 0.85,
      emotion: 'normal',
    },
  ],

  // 5. Pukul 12:00 Siang - Jeritan Pertama & Wabah Pecah!
  ch_outbreak_12pm: [
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'ITU BUKAN YEL-YEL!! Lihat ke luar jendela lapangan!! ASTAGA TUHAN...',
      voicePitch: 1.0,
      emotion: 'shock',
    },
    {
      speaker: 'Lia',
      portrait: 'lia',
      text: 'ORANG-ORANG SALING GIGIT LEHER!! Darahnya muncrat di mana-mana!! Murid-murid lain berlarian histeris!!',
      voicePitch: 1.4,
      emotion: 'shock',
    },
    {
      speaker: 'Farel',
      portrait: 'farel',
      text: 'PINTU KELAS KITA DIGEDOR DARI LUAR!! MEREKA MAU MASUKKKK!!',
      voicePitch: 1.3,
      emotion: 'shock',
    },
    {
      speaker: 'Rafli',
      portrait: 'rafli',
      text: 'Tarik meja-meja siswa sekarang! BARIKADE PINTUNYA CEPAT!! Jangan sampai mereka jebol ke dalam!',
      voicePitch: 0.9,
      emotion: 'determined',
    },
    {
      speaker: 'Dafa',
      portrait: 'dafa',
      text: 'Dika, ambil mistar besi guru di depan meja! Gue tahan mejanya bareng Rafli!',
      voicePitch: 1.1,
      emotion: 'heroic',
    },
  ],

  // 6. Koridor Berdarah
  ch_corridor: [
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'Pintu kelas ini sudah mulai retak dicakar mereka. Kita harus cari Kunci Gerbang Utama di Pos Satpam ujung lorong!',
      voicePitch: 1.0,
      emotion: 'determined',
    },
    {
      speaker: 'Lia',
      portrait: 'lia',
      text: 'Lorongnya gelap gulita karena genset padam. Dika, nyalakan senter kamu (F). Hati-hati darah di lantai...',
      voicePitch: 1.2,
      emotion: 'normal',
    },
    {
      speaker: 'Rafli',
      portrait: 'rafli',
      text: 'Siapapun yang mendekat, hantam dengan mistar besi! Jangan ragu-ragu!',
      voicePitch: 0.9,
      emotion: 'determined',
    },
  ],

  // 7. Gerbang Sekolah & Pengorbanan Dafa
  ch_sacrifice_intro: [
    {
      speaker: 'Farel',
      portrait: 'farel',
      text: 'Itu dia Gerbang Utama sekolah! Tapi rantai gemboknya macet!!',
      voicePitch: 1.3,
      emotion: 'shock',
    },
    {
      speaker: 'Dafa',
      portrait: 'dafa',
      text: 'AWAS DI BELAKANG!! Pintu lorong jebol! Gerombolan puluhan zombie runner mengalir ke arah kita!!',
      voicePitch: 1.1,
      emotion: 'shock',
    },
  ],

  ch_sacrifice_climax: [
    {
      speaker: 'Lia',
      portrait: 'lia',
      text: 'DAFAAAA!! TANGAN KAMU DIGIGIT!!',
      voicePitch: 1.5,
      emotion: 'crying',
    },
    {
      speaker: 'Dafa',
      portrait: 'dafa',
      text: 'Ughh... sialan... Virusnya langsung masuk ke pembuluh darah gue...',
      voicePitch: 0.95,
      emotion: 'crying',
    },
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'Dafa bertahan!! Lia bawa perban P3K, kita balut lukanya!!',
      voicePitch: 1.0,
      emotion: 'shock',
    },
    {
      speaker: 'Dafa',
      portrait: 'dafa',
      text: 'Nggak ada waktu lagi, Dika!! Pintu gerbangnya udah kebuka sedikit! Bawa Lia, Rafli, sama Farel PERGI SEKARANG!!',
      voicePitch: 1.1,
      emotion: 'heroic',
    },
    {
      speaker: 'Dafa',
      portrait: 'dafa',
      text: 'Gue yang bakal tahan pintu besi lorong ini dari dalam!! Jangan nengok ke belakang!! Tolong... jaga mereka semua buat gue ya, Dik...',
      voicePitch: 0.9,
      emotion: 'heroic',
    },
    {
      speaker: 'Rafli',
      portrait: 'rafli',
      text: 'Dafa mengunci pintu lorong besi sendirian!! Dia menahan ratusan zombie pakai badannya!! AYO CEPAT LARI!!',
      voicePitch: 0.85,
      emotion: 'crying',
    },
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'DAFAAAAAAAAAAAA!!!',
      voicePitch: 1.0,
      emotion: 'crying',
    },
  ],

  // 8. Ending Demo: Cakrawala Jakarta yang Hancur
  ch_skyline: [
    {
      speaker: 'Lia',
      portrait: 'lia',
      text: 'Dafa... hiks... kenapa kamu harus berkorban sendirian...',
      voicePitch: 1.3,
      emotion: 'crying',
    },
    {
      speaker: 'Rafli',
      portrait: 'rafli',
      text: 'Kita berhasil keluar hidup-hidup sampai ke jalan layang flyover perbatasan... Dika, Lia, Farel... kita selamat...',
      voicePitch: 0.9,
      emotion: 'determined',
    },
    {
      speaker: 'Farel',
      portrait: 'farel',
      text: 'Tapi teman-teman... lihat ke arah cakrawala kota...',
      voicePitch: 1.2,
      emotion: 'shock',
    },
    {
      speaker: 'Dika',
      portrait: 'dika',
      text: 'Monas terbakar... gedung-gedung pencakar langit Jakarta runtuh diselimuti asap dan kabut tebal... Seluruh ibukota telah jatuh...',
      voicePitch: 1.0,
      emotion: 'determined',
    },
  ],
};
