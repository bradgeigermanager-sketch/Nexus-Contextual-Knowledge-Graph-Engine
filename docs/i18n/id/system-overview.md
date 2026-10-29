# Dokumentasi sistem — Bahasa Indonesia

## Bagian A — Uraian teknis

### Tujuan dan cakupan
Nexus Contextual Knowledge Graph Engine adalah lingkungan berbasis graf yang sedang dikembangkan untuk merepresentasikan entitas dan hubungan, mempertahankan konteks sumber dan bukti, memvalidasi data graf yang diimpor, serta menghubungkan wilayah pengetahuan yang lebih besar melalui artefak tingkat tinggi. Repositori saat ini berisi aplikasi HTML/React satu berkas, modul validasi JavaScript, data contoh JSON, skema, pengujian, dan otomasi GitHub Actions.

### Lapisan utama
1. **Graf kanonis:** simpul dan sisi mewakili entitas dan hubungan. ID dan atribut dipertahankan selama proses impor/ekspor yang didukung.
2. **Validasi dan pertukaran data:** pemeriksaan struktur, pemulihan keadaan tersimpan, mode impor, serta pengujian per format. CSV mendukung kolom bertanda kutip, tanda kutip yang di-escape, dan baris baru di dalam kolom. Pengimpor Cypher hanya menangani subset terbatas berbasis regex, bukan parser Cypher lengkap.
3. **Korpus referensi dan bukti:** catatan terpisah untuk sumber/karya, penulis/penerbit, klaim, dan tautan bukti. Bukti dapat menunjuk ke simpul, sisi, klaim, atau jalur terarah simpul–sisi–simpul. Sumber, klaim, sikap bukti, keandalan sumber, dan keyakinan ekstraksi adalah konsep yang berbeda.
4. **Lapisan artefak jaringan tingkat tinggi:** artefak berversi mengelompokkan referensi bertipe ke simpul, sisi, klaim, sumber, tautan bukti, konteks, dan artefak lain. Tautan antar artefak menunjukkan relasi seperti memuat, tumpang tindih, memberi konteks, menyangkal, atau bergantung pada. Istilah “neural” saat ini berarti konsep pemodelan jaringan tingkat tinggi; jaringan saraf terlatih belum diterapkan.
5. **Pengujian dan otomasi:** pengujian Node.js dan GitHub Actions memeriksa kontrak data dan data contoh yang didukung.

### Asal-usul dan ketidakpastian
Identitas objek kanonis harus dibedakan dari keanggotaannya dalam artefak. Jika relevan, simpan asal-usul, versi, metode derivasi, snapshot masukan, cakupan waktu/konteks, dan referensi bukti. Kemiripan, relevansi, bobot sisi, keyakinan, keandalan sumber, sikap bukti, dan kebenaran faktual tidak boleh digabung menjadi satu skor. Data uji sintetis bukan sitasi dunia nyata.

### Status implementasi
Cabang kerja saat ini berisi validasi graf dan pengujiannya, arsip kanonis beserta contoh impor, skema dan contoh korpus referensi/bukti, serta rancangan, skema, contoh, dan pengujian integritas untuk lapisan artefak. Editor referensi visual, penjelajah artefak, pengambilan sumber secara luas, dan inferensi jaringan saraf/embedding nyata masih merupakan pekerjaan mendatang. Periksa status GitHub Actions sebelum menyatakan commit terbaru lulus pengujian.

## Bagian B — Panduan bahasa sederhana

Nexus adalah proyek untuk menata informasi sebagai bagian-bagian yang saling terhubung. Simpul mewakili sesuatu atau suatu gagasan; sisi menunjukkan hubungan antara dua bagian. Sumber dan bukti membantu menjelaskan dari mana informasi berasal. Kelompok besar dari bagian-bagian yang terkait disebut artefak.

Contohnya, satu artefak dapat mengelompokkan sebuah laporan, suatu topik, hubungan di antara keduanya, dan sumber yang membahas hubungan itu. Artefak juga dapat terhubung dengan artefak lain. Ini membantu orang menjelajahi banyak informasi tanpa menyalin fakta yang sama berulang kali.

Sistem ini masih dikembangkan. Beberapa pemeriksaan data, contoh, skema, dan pengujian otomatis sudah tersedia. Editor visual lengkap, penemuan kelompok otomatis, dan analisis dengan jaringan saraf sungguhan belum selesai. Contoh berlabel sintetis hanya untuk demonstrasi, bukan bukti fakta nyata.

Untuk setiap informasi, pisahkan tiga pertanyaan: apa yang tertulis, sumber apa yang mendukungnya, dan seberapa yakin kita terhadap penafsirannya. Perbedaan pendapat dan ketidakpastian harus tetap terlihat.

## Tahap baru untuk memuat kumpulan data

Pemuat membaca graf, sumber, klaim, tautan bukti, artefak, dan tautan antarartefak secara bersamaan, lalu memeriksa referensinya dan membuat indeks pencarian. Berkas yang hilang dan referensi yang rusak dilaporkan, bukan diterima begitu saja. Ini adalah fitur pemuatan dan pemeriksaan konsistensi data, bukan jaringan saraf yang mempelajari atau membuktikan fakta.

Secara sederhana, sistem kini memiliki cara yang dapat digunakan ulang untuk mengumpulkan catatan yang saling terhubung dan memeriksa apakah tautannya mengarah ke catatan yang benar-benar ada sebelum bagian aplikasi lain menggunakannya. Pemuat ini belum terhubung ke antarmuka browser.


## Pembaruan pemuat korpus

Pemuat kini menggabungkan catatan graf, sumber, klaim, bukti, dan artefak tingkat tinggi menjadi satu kumpulan yang divalidasi dengan indeks pencarian. Berkas yang hilang dan referensi rusak akan dilaporkan. Ini fitur konsistensi data, bukan jaringan saraf yang mempelajari atau membuktikan fakta; fitur ini belum terhubung ke antarmuka browser.

## Pembaruan: penelusuran hubungan

Kode kini memiliki penelusuran korpus berbatas yang dimulai dari referensi bertipe, seperti simpul, sisi, sumber, klaim, tautan bukti, atau artefak. Fitur ini mengembalikan rekaman yang dapat dijangkau beserta jalur yang mempertahankan jenis hubungan dan referensi bukti yang tersedia. Kedalaman dan jumlah hasil dibatasi. Ini adalah penelusuran graf deterministik, bukan inferensi jaringan saraf atau bukti kebenaran; fitur ini belum terhubung ke antarmuka browser.

## Pembaruan lapisan kueri

Modul kueri kini menerima referensi awal bertipe dan target opsional, serta filter untuk jenis rekaman, jenis artefak, status, domain konteks, dan jenis atau kategori hubungan. Hasilnya menyatakan apakah target tercapai, apakah jalur yang ditemukan memenuhi filter, dan apakah penelusuran terpotong oleh batas. Batasan penting: filter diterapkan setelah penelusuran berbatas, dan hanya jalur terpendek yang ditemukan untuk setiap rekaman yang tercapai yang dikembalikan. Fitur ini mendukung navigasi dan peninjauan, bukan pencatatan semua jalur, pemeringkatan semantik, atau pembuktian kebenaran. Modul ini belum terhubung ke antarmuka browser.
