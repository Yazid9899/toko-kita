import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { customers, type InsertCustomer } from "../shared/schema";

// TODO: Replace demo entries with real customer data or load from ENV/CSV.
const seedCustomers: InsertCustomer[] = [
  {
    name: "asfarina ayu",
    phoneNumber: "089601873423",
    addressLine:
      "Jl Tinosidin no 398 ngestiharjo, kasihan bantul Yogyakarta ( YEELE ) (Dyota toys) KASIHAN, KAB. BANTUL, DI YOGYAKARTA, ID, 55182",
    kecamatan: "Kasihan",
    cityOrKabupaten: "Kab. Bantul",
    postCode: "55182",
    note: "YEELE / Dyota toys",
    customerType: "PERSONAL",
  },
  {
    name: "Neera Puri",
    phoneNumber: "089631489110",
    addressLine:
      "Jalan Paseban Dalam No.10, RT.1/RW.7, Paseban, SENEN, KOTA JAKARTA PUSAT, DKI JAKARTA, ID, 10440",
    kecamatan: "Senen",
    cityOrKabupaten: "Kota Jakarta Pusat",
    postCode: "10440",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Agnes Angelin",
    phoneNumber: "08113201455",
    addressLine:
      "Apartemen Pakuwon City Mall - Bella Tower unit 08-12 Kejawaan Putih Tamba, Kec. Mulyorejo, Surabaya 60112",
    kecamatan: "Mulyorejo",
    cityOrKabupaten: "Surabaya",
    postCode: "60112",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Andi Zuchairiny",
    phoneNumber: "081348956521",
    addressLine:
      "Perumahan Bogor View 2 Blok L No. 10 Bogor kp 16115, kec. Bogor Barar & kota Bogor",
    kecamatan: "Bogor Barat",
    cityOrKabupaten: "Kota Bogor",
    postCode: "16115",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "anengsih",
    phoneNumber: "082246550007",
    addressLine:
      "jl.raya tipar cakung gg.pacong rt.003 rw.02 no.3 kel.sukapura kec.cilincing jakarta utara.14140",
    kecamatan: "Cilincing",
    cityOrKabupaten: "Jakarta Utara",
    postCode: "14140",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Ayu Citra F.",
    phoneNumber: "08112695554",
    addressLine:
      "Pesona Griya Blok S No. 3 Kel. Kauman Kec. Batang Kab. Batang Prov. Jateng 51215",
    kecamatan: "Batang",
    cityOrKabupaten: "Kab. Batang",
    postCode: "51215",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "bundadazame",
    phoneNumber: "260118CB5U5KKJ",
    addressLine: "SHOPEE",
    kecamatan: "",
    cityOrKabupaten: "",
    postCode: "",
    note: "Shopee",
    customerType: "PERSONAL",
  },
  {
    name: "Chika laily",
    phoneNumber: "081294712797",
    addressLine:
      "Jl H Domang 1A rt6/13 kebon jeruk, jakarta barat, 11530 (notes : Rumah tingkat gerbang hitam coklat)",
    kecamatan: "Kebon Jeruk",
    cityOrKabupaten: "Jakarta Barat",
    postCode: "11530",
    note: "Rumah tingkat, gerbang hitam coklat",
    customerType: "PERSONAL",
  },
  {
    name: "Cytra Primasari",
    phoneNumber: "081382373971",
    addressLine:
      "Perum Wisma Jaya Jl Kusuma Barat VI Blok DD2/11 RT 03/18 Bekasi Timur 17111",
    kecamatan: "Bekasi Timur",
    cityOrKabupaten: "Bekasi",
    postCode: "17111",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "dear_cha",
    phoneNumber: "260201HTP4YK5V",
    addressLine: "SHOPEE",
    kecamatan: "",
    cityOrKabupaten: "",
    postCode: "",
    note: "Shopee",
    customerType: "PERSONAL",
  },
  {
    name: "Devi Eddie",
    phoneNumber: "08122618485",
    addressLine: "Emerald Terrace A1/28, Parigi, Pondok Aren, Kota Tangerang Selatan, 15227",
    kecamatan: "Pondok Aren",
    cityOrKabupaten: "Kota Tangerang Selatan",
    postCode: "15227",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "diel miel anna",
    phoneNumber: "085777065752",
    addressLine: "Bukit Cengkeh 2 Blok D3 no 16, Kel Tugu Kec Cimanggis, Depok 16451",
    kecamatan: "Cimanggis",
    cityOrKabupaten: "Depok",
    postCode: "16451",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Dienar Ria",
    phoneNumber: "081333330165",
    addressLine: "Delta Sari Indah Blok AD no 76 Waru Sidoarjo 61256",
    kecamatan: "Waru",
    cityOrKabupaten: "Sidoarjo",
    postCode: "61256",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Dilla",
    phoneNumber: "08122224206",
    addressLine:
      "Sepanjang Jaya Residence No. 6 Jl. Siliwangi rawa panjang Gang Pemuda RT 002 Rw 005 Rawalumbu Kota Bekasi 17114",
    kecamatan: "Rawalumbu",
    cityOrKabupaten: "Kota Bekasi",
    postCode: "17114",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Dupit Malinda",
    phoneNumber: "081349195519",
    addressLine:
      "jalan Ahmad Sood, gg. H. Umar Suud. No,157 depan SMA negeri 1 Sambas, Kab. Sambas, Kalbar",
    kecamatan: "Sambas",
    cityOrKabupaten: "Kab. Sambas",
    postCode: "79463",
    note: "Depan SMA Negeri 1 Sambas",
    customerType: "PERSONAL",
  },
  {
    name: "Eva noprrianti",
    phoneNumber: "082159155151",
    addressLine:
      "Jl angkatan 66 Lorong harapan 2 No 1466 RT 20 Pipa Reja , Kemuning, Palembang sumatera selatan",
    kecamatan: "Kemuning",
    cityOrKabupaten: "Palembang",
    postCode: "30961",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Firly",
    phoneNumber: "081316622044",
    addressLine: "Mahagoni park B2/15 pondok aren bintaro",
    kecamatan: "Pondok Aren",
    cityOrKabupaten: "Tangerang Selatan",
    postCode: "15228",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "ftrmsyf",
    phoneNumber: "260123RGVXKQUF",
    addressLine: "SHOPEE",
    kecamatan: "",
    cityOrKabupaten: "",
    postCode: "",
    note: "Shopee",
    customerType: "PERSONAL",
  },
  {
    name: "Hana Tan",
    phoneNumber: "081229026226",
    addressLine:
      "Jl. Samudra Pasai X, RT.2/RW.7, Kadipiro, Banjarsari (pagar Coklat muda) (Depan Rumah Pak RT), KOTA SURAKARTA (SOLO), BANJARSARI, JAWA TENGAH, ID, 57136",
    kecamatan: "Banjarsari",
    cityOrKabupaten: "Kota Surakarta",
    postCode: "57136",
    note: "Pagar coklat muda; depan rumah Pak RT",
    customerType: "RESELLER",
  },
  {
    name: "Hani Iskandar",
    phoneNumber: "081295193991",
    addressLine:
      "Jl.Darmawanita II no.114-115 rt 09/ rw 01 Rawabuaya, Cengkareng, Jakarta Barat 11740",
    kecamatan: "Cengkareng",
    cityOrKabupaten: "Jakarta Barat",
    postCode: "11740",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Hefi Setiawati",
    phoneNumber: "081380169903",
    addressLine: "Graha Pratama Bintaro Blok D No.2 Pondok Aren Tangerang Selatan 15224",
    kecamatan: "Pondok Aren",
    cityOrKabupaten: "Tangerang Selatan",
    postCode: "15224",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "hellopandahehe",
    phoneNumber: "260120J2N0RQFX",
    addressLine: "SHOPEE",
    kecamatan: "",
    cityOrKabupaten: "",
    postCode: "",
    note: "Shopee",
    customerType: "PERSONAL",
  },
  {
    name: "indirabungac",
    phoneNumber: "260129B817AM92",
    addressLine: "SHOPEE",
    kecamatan: "",
    cityOrKabupaten: "",
    postCode: "",
    note: "Shopee",
    customerType: "PERSONAL",
  },
  {
    name: "irma avianti",
    phoneNumber: "081314149869",
    addressLine:
      "Permata Depok, sektor Nilam F4 No.4, Pondok Jaya, Cipayung -DEPOK 16438",
    kecamatan: "Cipayung",
    cityOrKabupaten: "Depok",
    postCode: "16438",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Juwita. R",
    phoneNumber: "085224148940",
    addressLine:
      "Jalan Ki Gede Mayung No 1 (PAUD Miftahul Ilmi) Desa Sambeng Rt/rw 11/4, KAB. CIREBON, GUNUNG JATI (CIREBON UTARA), JAWA BARAT, ID, 45151",
    kecamatan: "Gunung Jati",
    cityOrKabupaten: "Kab. Cirebon",
    postCode: "45151",
    note: "PAUD Miftahul Ilmi",
    customerType: "PERSONAL",
  },
  {
    name: "Karen Pungki",
    phoneNumber: "085693028262",
    addressLine:
      "Klinik Pratama Pertamina RU III (deretan bank Mandiri Komperta), Komperta Plaju, Kota Palembang, Sumatera Selatan 30268",
    kecamatan: "Plaju",
    cityOrKabupaten: "Kota Palembang",
    postCode: "30268",
    note: "Klinik Pratama Pertamina RU III",
    customerType: "PERSONAL",
  },
  {
    name: "KARTIKA",
    phoneNumber: "087894185471",
    addressLine:
      "metland tambun jln kalimaya raya blok B1 no 14 tambun selatan bekasi 17510",
    kecamatan: "Tambun Selatan",
    cityOrKabupaten: "Bekasi",
    postCode: "17510",
    note: "",
    customerType: "RESELLER",
  },
  {
    name: "Mami kayla",
    phoneNumber: "085267947700",
    addressLine:
      "Perumahan aur kuning blok e 2 no 2 Jl aur kuning kel simpang tiga kec bukit raya pekanbaru riau",
    kecamatan: "Bukit Raya",
    cityOrKabupaten: "Pekanbaru",
    postCode: "28284",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "maria goreti nur tyas p",
    phoneNumber: "085218860396",
    addressLine:
      "kementerian Agraria dan Tata Ruang/BPN (biro umum dan layanan pengadaan lantai 1) Jl. Sisingamangaraja no. 2 kebayoran baru jakarta selatan",
    kecamatan: "Kebayoran Baru",
    cityOrKabupaten: "Jakarta Selatan",
    postCode: "12110",
    note: "ATR/BPN lantai 1",
    customerType: "PERSONAL",
  },
  {
    name: "meli ginting",
    phoneNumber: "081533444119",
    addressLine: "Jl. Bunga Sedap Malam IX No. 3B. P.B Selayang 2 Medan 20131",
    kecamatan: "Medan Selayang",
    cityOrKabupaten: "Medan",
    postCode: "20131",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Micel",
    phoneNumber: "081235070878",
    addressLine: "Manyar jaya 2 blok a 56 Surabaya 60118 Sukolilo Menur pumpungan Jawa timur",
    kecamatan: "Sukolilo",
    cityOrKabupaten: "Surabaya",
    postCode: "60118",
    note: "",
    customerType: "RESELLER",
  },
  {
    name: "Nabila eka putri",
    phoneNumber: "081322392639",
    addressLine:
      "Gg. Madun 1 No.27, Pd. Kacang Tim., RT.02/05 KOTA TANGERANG SELATAN, PONDOK AREN, BANTEN, ID, 15226",
    kecamatan: "Pondok Aren",
    cityOrKabupaten: "Kota Tangerang Selatan",
    postCode: "15226",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "nia ikrimah",
    phoneNumber: "08567625690",
    addressLine:
      "Taman Royal 3 Jl. Mahogani 1.A Blok A16/10A cipondoh kota tangerang 15141",
    kecamatan: "Cipondoh",
    cityOrKabupaten: "Kota Tangerang",
    postCode: "15141",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Nikchy",
    phoneNumber: "08989929424",
    addressLine:
      "Permata Bogor Residence blok B19 no 9, Jl Raya cilebut Sukaraja Bogor 16710",
    kecamatan: "Sukaraja",
    cityOrKabupaten: "Bogor",
    postCode: "16710",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Ningsih Musef",
    phoneNumber: "081297777035",
    addressLine:
      "Cluster Victoria Blok i 7 no. 11 Metland Ujung Menteng Cakung Jakarta 13960",
    kecamatan: "Cakung",
    cityOrKabupaten: "Jakarta Timur",
    postCode: "13960",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "NOVITA RIEZKY MAYANGSARI",
    phoneNumber: "081249834626",
    addressLine: "BANK MANDIRI KALITIDU, JL RAYA BOJONEGORO- CEPU 62152",
    kecamatan: "Kalitidu",
    cityOrKabupaten: "Bojonegoro",
    postCode: "62152",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Noviyanti",
    phoneNumber: "0859206665649",
    addressLine:
      "Jl slada II rt005/011 pondok cabe ilir (jl joglo kontrakan gang buntu ujung kiri), Pamulang, Kota Tangerang Selatan, Banten 15418 (Tolong ditaruh aja di sela pintu ya)",
    kecamatan: "Pamulang",
    cityOrKabupaten: "Kota Tangerang Selatan",
    postCode: "15418",
    note: "Tolong ditaruh di sela pintu",
    customerType: "PERSONAL",
  },
  {
    name: "nuri pratama",
    phoneNumber: "081296046476",
    addressLine:
      "perumahan grand sutera blok b7 no 34 kel. Lebak denok kec Citangkil kota Cilegon",
    kecamatan: "Citangkil",
    cityOrKabupaten: "Kota Cilegon",
    postCode: "42442",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Regina Yulandari",
    phoneNumber: "085373602025",
    addressLine:
      "jln. Soekarno -Hatta, Mibo. Kec. Banda Raya, RSUD Meuraxa Kota Banda Aceh (Ruangan Arafah) Provinsi Aceh",
    kecamatan: "Banda Raya",
    cityOrKabupaten: "Kota Banda Aceh",
    postCode: "23231",
    note: "RSUD Meuraxa (Ruangan Arafah)",
    customerType: "PERSONAL",
  },
  {
    name: "Safrida ika",
    phoneNumber: "08170680662",
    addressLine:
      "Jln. Salak raya RT.10/04 Griya Salak Raya, kav E-10 Kecamatan cipayung Kelurahan munjul Jakarta Timur",
    kecamatan: "Cipayung",
    cityOrKabupaten: "Jakarta Timur",
    postCode: "13850",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Safrida Nina Fauzanah",
    phoneNumber: "081296505582",
    addressLine: "Jl.Pangkalan jati 5 Rt 04/05 no.12 Cipinang melayu Jaktim 13620",
    kecamatan: "Cipinang Melayu",
    cityOrKabupaten: "Jakarta Timur",
    postCode: "13620",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Sita",
    phoneNumber: "085707780650",
    addressLine: "Jl. Wisma Permai Barat I/MM-39, Kec. Mulyorejo, Surabaya 60115",
    kecamatan: "Mulyorejo",
    cityOrKabupaten: "Surabaya",
    postCode: "60115",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Siti Rahayu",
    phoneNumber: "085719725050",
    addressLine:
      "Bedahan rt.05/rw.01 no.50, kel. Pabuaran mekar, kec. Cibinong, kab. Bogor. 16916",
    kecamatan: "Cibinong",
    cityOrKabupaten: "Kab. Bogor",
    postCode: "16916",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "soraya",
    phoneNumber: "082340588483",
    addressLine:
      "Tegalsari Tegaltirto Berbah, Kuton, Tegaltirto, Kec. Berbah, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55573",
    kecamatan: "Berbah",
    cityOrKabupaten: "Kabupaten Sleman",
    postCode: "55573",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Sri Yulia Rinawati",
    phoneNumber: "085714656496",
    addressLine: "Verdant Ville G3 no 40 The Icon BSD City Tangerang 15345",
    kecamatan: "Cisauk",
    cityOrKabupaten: "Tangerang",
    postCode: "15345",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "stella (gift)",
    phoneNumber: "",
    addressLine: "",
    kecamatan: "",
    cityOrKabupaten: "",
    postCode: "",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "sulis",
    phoneNumber: "085882958749",
    addressLine: "Jl. Siaga Swadaya no.20 Rt07 rw04 pejaten barat Ps.Minggu JakSel 12510",
    kecamatan: "Pasar Minggu",
    cityOrKabupaten: "Jakarta Selatan",
    postCode: "12510",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Syifa Fauziah",
    phoneNumber: "08118035365",
    addressLine:
      "Jalan Bintara 8 RT 04/03 No.1 (Mie Ayam Pakde Kumis Pinggir Jalan) Kelurahan Bintara, Kecamatan Bekasi Barat, Kota Bekasi 17134.",
    kecamatan: "Bekasi Barat",
    cityOrKabupaten: "Kota Bekasi",
    postCode: "17134",
    note: "Patokan: Mie Ayam Pakde Kumis pinggir jalan",
    customerType: "PERSONAL",
  },
  {
    name: "tania Amelia",
    phoneNumber: "085777065752",
    addressLine:
      "Springhill Yume Lagoon (Blok B3 No 1), Jalan Raya Suradita, KAB. TANGERANG, CISAUK, BANTEN, ID, 1534",
    kecamatan: "Cisauk",
    cityOrKabupaten: "Kab. Tangerang",
    postCode: "01534",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "tia",
    phoneNumber: "081227717873",
    addressLine:
      "jalan raya patikraja- banyumas rt 2 rw 2 , desa Pegalongan, kec. Patikraja, kab. Banyumas 53171, JAwa Tengah",
    kecamatan: "Patikraja",
    cityOrKabupaten: "Kab. Banyumas",
    postCode: "53171",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Tita Eka Fuspita",
    phoneNumber: "08112002400",
    addressLine:
      "Komp. PPT Al-Multazam Ds. Maniskidul Kec. Jalaksana Kan. Kuningan JABAR 45554",
    kecamatan: "Jalaksana",
    cityOrKabupaten: "Kab. Kuningan",
    postCode: "45554",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Titi Tamira",
    phoneNumber: "082189551739",
    addressLine:
      "Jln. Andi tadde perumahan green villa Kav.5 (Samping SMP 10), timungan lompoa, Bontoala, Makassar, Sulawesi Selatan",
    kecamatan: "Bontoala",
    cityOrKabupaten: "Makassar",
    postCode: "90211",
    note: "Samping SMP 10",
    customerType: "PERSONAL",
  },
  {
    name: "Tri Winarni",
    phoneNumber: "081575222095",
    addressLine:
      "Kantor BPJS Ketenagakerjaan Kudus Jl. Pramuka no.368 Mlati Lor Kecamatan Kota Kabupaten Kudus Jawa Tengah 59319",
    kecamatan: "Kota Kudus",
    cityOrKabupaten: "Kabupaten Kudus",
    postCode: "59319",
    note: "Kantor BPJS Ketenagakerjaan",
    customerType: "PERSONAL",
  },
  {
    name: "tuty",
    phoneNumber: "081393544955",
    addressLine: "Green Mustika Residence Blok E1A Mustika Jaya Bekasi 17158",
    kecamatan: "Mustika Jaya",
    cityOrKabupaten: "Bekasi",
    postCode: "17158",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Vina",
    phoneNumber: "085811587899",
    addressLine: "jl. Tambora 3 gg 2 no 6a rt 006 rw 03",
    kecamatan: "Tambora",
    cityOrKabupaten: "Jakarta Barat",
    postCode: "11220",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "viniazizah",
    phoneNumber: "082141886821",
    addressLine: "perum airport village blok E1 sedatigede kab sidoarjo 61253",
    kecamatan: "Sedati",
    cityOrKabupaten: "Kab. Sidoarjo",
    postCode: "61253",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Yanna",
    phoneNumber: "081344443075",
    addressLine:
      "Jl. Gunuk raya No. 1A, RT.4/RW.3 Poltangan Kec. Pasar Minggu Kota Jakarta Selatan",
    kecamatan: "Pasar Minggu",
    cityOrKabupaten: "Jakarta Selatan",
    postCode: "12520",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "yanti Pt bangun mitra makmur",
    phoneNumber: "08127975599",
    addressLine: "jl ikan kakap no 26 , Teluk Betung - Bandar Lampung",
    kecamatan: "Teluk Betung",
    cityOrKabupaten: "Bandar Lampung",
    postCode: "35221",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Yenny",
    phoneNumber: "085947419081",
    addressLine:
      "Apartemen Grand Emerald 2WK, jl. Pegangsaan dua, kelapa gading, jakarta utara 14250",
    kecamatan: "Kelapa Gading",
    cityOrKabupaten: "Jakarta Utara",
    postCode: "14250",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Yurie Wulandari",
    phoneNumber: "081320741718",
    addressLine: "Jl. Garuda 6 No. 8 A, Kel. Sutawinangun, Kec. Kedawung, CIREBON, 45153",
    kecamatan: "Kedawung",
    cityOrKabupaten: "Cirebon",
    postCode: "45153",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "zelwia",
    phoneNumber: "082182902626",
    addressLine: "Jl. A. Rahman Raya No. 28, Tanjung Senang, Bandar Lampung, Lampung",
    kecamatan: "Tanjung Senang",
    cityOrKabupaten: "Bandar Lampung",
    postCode: "25414",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Diana Rakhmawaty Eddy",
    phoneNumber: "081322731173",
    addressLine:
      "Komp Vila Bandung Indah Blok A6 no 27 (Jln Gunung gede) RT 02/RW 20 Samping TK Mutiara Kartika Desa: Cimekar Kecamatan : Cileunyi Kab. Bandung Timur 40393",
    kecamatan: "Cileunyi",
    cityOrKabupaten: "Kab. Bandung Timur",
    postCode: "40393",
    note: "Samping TK Mutiara Kartika",
    customerType: "PERSONAL",
  },
  {
    name: "indriyani",
    phoneNumber: "081288062394",
    addressLine: "kp tonggoh rt 01 rw 01 desa gunung sari kecamatan citeureup kab bogor 16811",
    kecamatan: "Citeureup",
    cityOrKabupaten: "Kab Bogor",
    postCode: "16811",
    note: "",
    customerType: "PERSONAL",
  },
  {
    name: "Indri Indrayani",
    phoneNumber: "087889897736",
    addressLine:
      "Jl Melati No 42A (depan rumah no 3) Larangan Indah Kel. Larangan Indah Kec. Larangan Tangerang 15154",
    kecamatan: "Larangan",
    cityOrKabupaten: "Tangerang",
    postCode: "15154",
    note: "Depan rumah no 3",
    customerType: "PERSONAL",
  },
  {
    name: "ida setyawati",
    phoneNumber: "08122861874",
    addressLine:
      "jl. PUSPOWARNO V NO 2 RT.006 RW 003 KEL. SALAMANMLOYO KEC SEMARANG BARAT KOTA SEMARANG 50149",
    kecamatan: "Semarang Barat",
    cityOrKabupaten: "Kota Semarang",
    postCode: "50149",
    note: "",
    customerType: "PERSONAL",
  }

];

async function upsertCustomer(entry: InsertCustomer): Promise<"inserted" | "updated"> {
  const existing = await db.select().from(customers).where(eq(customers.phoneNumber, entry.phoneNumber));

  if (existing.length) {
    await db
      .update(customers)
      .set({
        ...entry,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, existing[0].id));
    return "updated";
  }

  await db.insert(customers).values(entry);
  return "inserted";
}

async function main() {
  try {
    let inserted = 0;
    let updated = 0;

    for (const customer of seedCustomers) {
      const status = await upsertCustomer(customer);
      status === "inserted" ? inserted++ : updated++;
      console.log(`Seeded customer (${status}): ${customer.name} - ${customer.phoneNumber}`);
    }

    console.log(`Customers seeding done. Inserted: ${inserted}, Updated: ${updated}.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed customers:", error);
    process.exit(1);
  }
}

main();
