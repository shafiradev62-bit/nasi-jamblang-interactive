export interface ExamQuestion {
  id: number;
  type: "mcq" | "checkbox" | "open";
  question: string;
  questionIdn?: string;
  options?: string[];
  optionsIdn?: string[];
  correct?: string | string[];
  mediaUrl?: string;
  mediaType?: "image" | "video";
  explanation?: string;
  explanationIdn?: string;
}

// ── UNIT 1 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit1: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "What characteristic of teak leaves makes them suitable for food packaging?",
    questionIdn: "Karakteristik apa dari daun jati yang membuatnya cocok digunakan sebagai kemasan makanan?",
    options: [
      "They are synthetic and non-biodegradable",
      "They are wide, strong, flexible, porous, and not easily torn",
      "They are cheaper than all other packaging materials",
      "They are airtight like plastic and decompose slowly",
    ],
    optionsIdn: [
      "Bersifat sintetis dan tidak mudah terurai",
      "Lebar, kuat, elastis, berpori, dan tidak mudah robek",
      "Lebih murah dibandingkan semua bahan kemasan lain",
      "Kedap udara seperti plastik dan lambat terurai",
    ],
    correct: "They are wide, strong, flexible, porous, and not easily torn",
    explanation: "Teak leaves are wide, strong, flexible, porous, and tear-resistant, which makes them well suited as natural food wrappers.",
    explanationIdn: "Daun jati lebar, kuat, elastis, berpori, dan tidak mudah robek sehingga cocok digunakan sebagai pembungkus makanan alami.",
  },
  {
    id: 2,
    type: "mcq",
    question: "A vendor claims that plastic is better because it is more durable.\nBased on the information about environmental impacts of different packaging materials, which statement best evaluates this claim?",
    questionIdn: "Seorang pedagang berpendapat bahwa plastik lebih baik digunakan sebagai kemasan karena lebih tahan lama.\nBerdasarkan informasi tentang dampak lingkungan dari berbagai jenis bahan kemasan, pernyataan manakah yang paling tepat untuk mengevaluasi pendapat tersebut?",
    options: [
      "Durability is beneficial, but it can increase environmental impact",
      "Plastic is always better because it lasts longer",
      "Teak leaves are harmful because they decompose quickly",
      "Durability has no relationship with sustainability",
    ],
    optionsIdn: [
      "Daya tahan memang bermanfaat, tetapi dapat meningkatkan dampak lingkungan",
      "Plastik selalu lebih baik karena dapat bertahan lebih lama",
      "Daun jati berbahaya karena mudah terurai",
      "Daya tahan tidak berhubungan dengan keberlanjutan",
    ],
    correct: "Durability is beneficial, but it can increase environmental impact",
    explanation: "Highly durable materials like plastic take a very long time to decompose and accumulate in the environment. Durability is useful but increases environmental impact.",
    explanationIdn: "Bahan yang sangat tahan lama seperti plastik membutuhkan waktu sangat lama untuk terurai dan menumpuk di lingkungan. Daya tahan bermanfaat, tetapi meningkatkan dampak lingkungan.",
  },
];

// ── UNIT 2 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit2: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "Run the simulation by lowering the salt level while keeping the hygiene level poor. What happens to the contamination and spoilage risk?",
    questionIdn: "Jalankan simulasi dengan menurunkan kadar garam, sementara tingkat kebersihan tetap buruk. Apa yang terjadi pada risiko kontaminasi dan pembusukan?",
    options: [
      "Contamination and spoilage risk decreases",
      "Contamination and spoilage risk increases",
      "The risk stays exactly the same",
      "Salt has no effect on pathogen growth during fermentation",
    ],
    optionsIdn: [
      "Risiko kontaminasi dan pembusukan menurun",
      "Risiko kontaminasi dan pembusukan meningkat",
      "Risiko tetap sama persis",
      "Garam tidak berpengaruh pada pertumbuhan patogen selama fermentasi",
    ],
    correct: "Contamination and spoilage risk increases",
    explanation: "Reducing salt lowers the preservation effect that limits pathogen and spoilage microbe growth. With hygiene still poor, contamination remains likely, so the risk increases.",
    explanationIdn: "Menurunkan garam mengurangi efek pengawetan yang menghambat pertumbuhan patogen dan mikroba pembusuk. Karena kebersihan tetap buruk, kontaminasi masih mungkin terjadi sehingga risiko meningkat.",
  },
  {
    id: 2,
    type: "open",
    question: "After running the simulation, explain why a shorter drying time can change the terasi result. Use your simulation data in your answer.\n\nWriting guide: mention drying time, moisture/water content, pathogen or spoilage microbe growth, and the effect on quality or contamination/spoilage risk.",
    questionIdn: "Setelah menjalankan simulasi, jelaskan mengapa waktu pengeringan yang lebih singkat dapat mengubah hasil terasi. Gunakan data simulasi dalam jawabanmu.\n\nPanduan menulis: sebutkan waktu pengeringan, kadar air, pertumbuhan patogen atau mikroba pembusuk, serta pengaruhnya terhadap kualitas atau risiko kontaminasi/pembusukan.",
  },
];

// ── UNIT 3 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit3: ExamQuestion[] = [
  {
    id: 1,
    type: "open",
    question: "You are asked to investigate the most energy-efficient way to cook Empal Gentong.\n\nUse the simulation to determine:\nWhich combination of pot type, pot thickness, and heat input produces the highest energy efficiency?\n\nRecord your data and write your answer based on the results.",
    questionIdn: "Kamu diminta untuk menyelidiki cara memasak Empal Gentong yang paling efisien secara energi.\n\nGunakan simulasi untuk menentukan:\nKombinasi jenis wadah, ketebalan wadah, dan besar panas yang menghasilkan efisiensi energi tertinggi.\n\nCatat data dan tuliskan jawaban berdasarkan hasil simulasi.",
  },
  {
    id: 2,
    type: "mcq",
    question: "A chef uses:\n• A metal pot\n• Thin pot thickness\n• High heat input\n\nWhat is the most likely outcome?",
    questionIdn: "Seorang koki menggunakan:\n• Panci logam\n• Ketebalan tipis\n• Panas tinggi\n\nApa hasil yang paling mungkin terjadi?",
    options: [
      "High heat retention and low energy use",
      "Low heat retention and high energy use",
      "No difference compared to clay pot",
      "Only cooking time is affected",
    ],
    optionsIdn: [
      "Retensi panas tinggi dan energi rendah",
      "Retensi panas rendah dan energi tinggi",
      "Tidak ada perbedaan dengan tanah liat",
      "Hanya waktu memasak yang berubah",
    ],
    correct: "Low heat retention and high energy use",
  },
  {
    id: 3,
    type: "open",
    question: "A clay pot and a metal pot are used to cook the same dish under the same heat input.\nBased on the simulation results, which pot type is more energy-efficient?\n\nExplain why, using evidence from your recorded data table.",
    questionIdn: "Sebuah wadah tanah liat dan panci logam digunakan untuk memasak hidangan yang sama dengan panas yang sama.\nBerdasarkan hasil simulasi, jenis wadah mana yang lebih hemat energi?\n\nJelaskan alasannya menggunakan bukti dari tabel data yang kamu catat.",
  },
  {
    id: 4,
    type: "open",
    question: "A restaurant owner wants to reduce energy costs while maintaining good food quality.\nBased on your simulation data, recommend the best combination of pot type and wall thickness.\n\nSupport your recommendation with two rows of data from your table.",
    questionIdn: "Seorang pemilik restoran ingin mengurangi biaya energi sambil tetap menjaga kualitas masakan.\nBerdasarkan data simulasimu, rekomendasikan kombinasi terbaik antara jenis wadah dan ketebalan dinding.\n\nDukung rekomendasimu dengan dua baris data dari tabelmu.",
  },
  {
    id: 5,
    type: "open",
    question: "If you were a policymaker promoting sustainable cooking practices:\nWould you recommend using clay pots instead of metal pots?\n\nExplain your reasoning based on:\n• energy efficiency\n• environmental impact\n• sustainability",
    questionIdn: "Jika kamu seorang pembuat kebijakan yang ingin mendorong praktik memasak berkelanjutan:\nApakah kamu akan merekomendasikan penggunaan wadah tanah liat dibandingkan panci logam?\n\nJelaskan alasanmu berdasarkan:\n• efisiensi energi\n• dampak lingkungan\n• keberlanjutan",
  },
];

// ── UNIT 4 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit4: ExamQuestion[] = [
  {
    id: 1,
    type: "checkbox",
    question: "When hot sand is used instead of cooking oil, oil absorption decreases.\nWhich TWO statements best explain this scientifically?",
    questionIdn: "Ketika pasir panas digunakan sebagai pengganti minyak goreng, penyerapan minyak berkurang.\nManakah DUA pernyataan yang paling tepat menjelaskan hal ini secara ilmiah?",
    options: [
      "Sand does not contain oil",
      "Heat is transferred by direct contact without oil entering the food",
      "Sand increases the fat content of the food",
      "Sand makes oil diffuse faster into the food",
      "There is no heat transfer between the food and the hot sand",
    ],
    optionsIdn: [
      "Pasir tidak mengandung minyak",
      "Panas dipindahkan melalui kontak langsung tanpa minyak masuk ke makanan",
      "Pasir meningkatkan kandungan lemak pada makanan",
      "Pasir membuat minyak berdifusi lebih cepat ke makanan",
      "Tidak ada perpindahan panas antara makanan dan pasir panas",
    ],
    correct: ["Sand does not contain oil", "Heat is transferred by direct contact without oil entering the food"],
    explanation: "Sand transfers heat by direct contact but contains no oil, so there is no oil source to be absorbed. This is why oil absorption is lower than in oil frying.",
    explanationIdn: "Pasir memindahkan panas melalui kontak langsung tetapi tidak mengandung minyak, sehingga tidak ada sumber minyak yang dapat diserap. Karena itu penyerapan minyak lebih rendah daripada menggoreng dengan minyak.",
  },
];

// ── UNIT 5 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit5: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "A student runs the simulation with these conditions:\n• Time: 48 hours\n• Temperature: 30°C\n• Packaging: Banana leaf\n• Starter: Good\n\nWhat is the main characteristic of the tape ketan produced?",
    questionIdn: "Seorang siswa menjalankan simulasi dengan kondisi berikut:\n• Waktu: 48 jam\n• Suhu: 30°C\n• Kemasan: daun pisang\n• Starter (ragi): baik\n\nApa karakteristik utama tape ketan yang dihasilkan?",
    options: [
      "Very low sugar and no aroma",
      "Sweet taste with slight alcohol",
      "Very sour and spoiled",
      "No fermentation occurs",
    ],
    optionsIdn: [
      "Kadar gula sangat rendah dan tidak beraroma",
      "Rasa manis dengan sedikit kandungan alkohol",
      "Sangat asam dan rusak",
      "Tidak terjadi fermentasi",
    ],
    correct: "Sweet taste with slight alcohol",
  },
  {
    id: 2,
    type: "mcq",
    question: "Run two simulations with the same time, temperature, and starter quality, but use different packaging:\n1. Banana leaf\n2. Plastic\n\nWhat is the effect of using banana leaf packaging?",
    questionIdn: "Jalankan dua simulasi dengan waktu, suhu, dan kualitas starter yang sama, tetapi gunakan jenis kemasan yang berbeda:\n1. Daun pisang\n2. Plastik\n\nApa pengaruh penggunaan kemasan daun pisang?",
    options: [
      "It increases plastic waste",
      "It stops fermentation",
      "It improves sustainability and can support preferred quality",
      "It always lowers sweetness to zero",
    ],
    optionsIdn: [
      "Meningkatkan limbah plastik",
      "Menghentikan proses fermentasi",
      "Meningkatkan keberlanjutan dan dapat mendukung kualitas yang lebih disukai",
      "Selalu menurunkan rasa manis menjadi nol",
    ],
    correct: "It improves sustainability and can support preferred quality",
  },
  {
    id: 3,
    type: "open",
    question: "Compare a simulation at 48 hours and another at 72 hours, while keeping the other variables the same.\n\nWhat happens to the taste as fermentation time increases, and why?\n• Sweetness increases, or\n• Sweetness decreases",
    questionIdn: "Bandingkan simulasi pada 48 jam dan 72 jam dengan variabel lainnya tetap sama.\n\nApa yang terjadi pada rasa seiring bertambahnya waktu fermentasi, dan mengapa?\n• Rasa manis meningkat, atau\n• Rasa manis menurun",
  },
  {
    id: 4,
    type: "open",
    question: "Use the simulation to find a combination that produces:\n• Good taste\n• Medium acidity\n• Longer shelf life\n\nWrite the best combination and use two rows of data from your table to support your answer.\n\nWriting guide: A strong answer should state one best combination, then cite two rows from the table as evidence for taste, pH/acidity, and shelf life.",
    questionIdn: "Gunakan simulasi untuk menemukan kombinasi yang menghasilkan:\n• Rasa yang enak\n• Keasaman sedang\n• Daya simpan lebih lama\n\nTuliskan kombinasi terbaik dan gunakan dua baris data dari tabelmu untuk mendukung jawabanmu.\n\nPanduan Penulisan: Jawaban yang baik harus menyebutkan satu kombinasi terbaik, kemudian mengutip dua baris dari tabel sebagai bukti untuk rasa, pH/keasaman, dan daya simpan.",
  },
  {
    id: 5,
    type: "open",
    question: "A producer wants to make tape ketan that is:\n• environmentally friendly\n• good quality\n• longer-lasting\n\nShould the producer use banana leaf or plastic packaging?\n\nWriting guide: A strong answer should compare banana leaf and plastic in terms of biodegradability, food quality, and waste reduction, then make a clear recommendation.",
    questionIdn: "Seorang produsen ingin membuat tape ketan yang:\n• ramah lingkungan\n• berkualitas baik\n• lebih tahan lama\n\nApakah produsen sebaiknya menggunakan kemasan daun pisang atau plastik?\n\nPanduan Penulisan: Jawaban yang baik harus membandingkan daun pisang dan plastik dalam hal biodegradabilitas (kemampuan terurai), kualitas pangan, dan pengurangan limbah, kemudian memberikan rekomendasi yang jelas.",
  },
];

export const examQuestionsUnit6: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "Mangrove forests can protect coastal areas from erosion. Which statement best explains how mangroves reduce coastal erosion?",
    questionIdn: "Hutan mangrove dapat melindungi wilayah pesisir dari abrasi. Pernyataan manakah yang paling tepat menjelaskan bagaimana mangrove mengurangi abrasi pantai?",
    options: [
      "Mangroves increase seawater temperature, making waves weaker.",
      "Mangrove roots trap sediment and reduce wave energy before it reaches the shore.",
      "Mangroves increase salinity so that the coastline becomes harder.",
      "Mangroves speed up the movement of coastal water away from the land.",
    ],
    optionsIdn: [
      "Mangrove meningkatkan suhu air laut sehingga gelombang menjadi lebih lemah.",
      "Akar mangrove menjebak sedimen dan mengurangi energi gelombang sebelum mencapai pantai.",
      "Mangrove meningkatkan salinitas sehingga garis pantai menjadi lebih keras.",
      "Mangrove mempercepat pergerakan air pesisir menjauh dari daratan.",
    ],
    correct: "Mangrove roots trap sediment and reduce wave energy before it reaches the shore.",
  },
  {
    id: 2,
    type: "mcq",
    question: "A student changes the simulation from 70% mangrove cover to 20% mangrove cover, while wave strength and other variables remain the same. What change is most likely to happen?",
    questionIdn: "Seorang siswa mengubah simulasi dari 70% tutupan mangrove menjadi 20% tutupan mangrove, sementara kekuatan gelombang dan variabel lainnya tetap sama. Perubahan apa yang paling mungkin terjadi?",
    options: [
      "Coastal erosion decreases and biodiversity increases.",
      "Flood risk increases and fish production may decrease.",
      "Carbon storage increases because fewer trees are present.",
      "There is no major change because waves are the only important factor.",
    ],
    optionsIdn: [
      "Abrasi pantai berkurang dan keanekaragaman hayati meningkat.",
      "Risiko banjir meningkat dan produksi ikan dapat menurun.",
      "Penyimpanan karbon meningkat karena jumlah pohon lebih sedikit.",
      "Tidak ada perubahan besar karena gelombang adalah satu-satunya faktor penting.",
    ],
    correct: "Flood risk increases and fish production may decrease.",
  },
  {
    id: 3,
    type: "open",
    question: "Explain the relationship between mangrove cover and fish production in coastal ecosystems. Your explanation should use scientific ideas.\n\nThink about the role of mangroves as habitat, nursery grounds, and shelter for marine organisms.\n\nWriting guide: A strong answer explains that mangroves provide habitat, food, and nursery areas for fish and other organisms. When mangrove cover decreases, fewer young fish survive, so fish production can decline.",
    questionIdn: "Jelaskan hubungan antara tutupan mangrove dan produksi ikan di ekosistem pesisir. Penjelasanmu harus menggunakan konsep ilmiah.\n\nPikirkan tentang peran mangrove sebagai habitat, tempat pembesaran (nursery ground), dan tempat berlindung bagi organisme laut.\n\nPanduan Menulis: Jawaban yang kuat menjelaskan bahwa mangrove menyediakan habitat, sumber makanan, dan area pembesaran bagi ikan serta organisme lainnya. Ketika tutupan mangrove berkurang, lebih sedikit ikan muda yang dapat bertahan hidup, sehingga produksi ikan dapat menurun.",
  },
  {
    id: 4,
    type: "open",
    question: "A community wants to convert more coastal land into ponds and housing. Compare two conditions using the simulation:\n• Condition 1: High mangrove cover\n• Condition 2: Low mangrove cover\n\nExplain the short-term and long-term effects of these conditions on the coast. Use at least two pieces of evidence from your simulation results.\n\nA strong answer compares outcomes such as erosion, flood risk, fish production, or biodiversity under two different mangrove levels. It should mention that short-term land conversion may increase development space, but long-term it can increase erosion and reduce ecosystem services.",
    questionIdn: "Sebuah komunitas ingin mengalihfungsikan lebih banyak lahan pesisir menjadi tambak dan perumahan. Bandingkan dua kondisi berikut dengan menggunakan simulasi:\n• Kondisi 1: Tutupan mangrove tinggi\n• Kondisi 2: Tutupan mangrove rendah\n\nJelaskan dampak jangka pendek dan jangka panjang dari kedua kondisi tersebut terhadap wilayah pesisir. Gunakan setidaknya dua bukti dari hasil simulasimu.\n\nPanduan Jawaban: Jawaban yang kuat membandingkan hasil seperti abrasi, risiko banjir, produksi ikan, atau keanekaragaman hayati pada dua tingkat mangrove yang berbeda. Jawaban juga harus menyebutkan bahwa alih fungsi lahan dalam jangka pendek dapat menambah ruang untuk pembangunan, tetapi dalam jangka panjang dapat meningkatkan abrasi dan mengurangi jasa ekosistem.",
  },
  {
    id: 5,
    type: "open",
    question: "The local government in Cirebon wants to reduce coastal erosion. Based on the information and your simulation results, recommend the best policy action.\n\nYour answer should include:\n• one main strategy\n• a scientific reason\n• a long-term effect on the coastal ecosystem\n\nA strong recommendation may include mangrove restoration, limiting high-impact land conversion, and protecting coastal habitat. It should justify the decision using scientific evidence such as lower erosion, lower flood risk, higher fish production, and greater carbon storage.",
    questionIdn: "Pemerintah daerah di Cirebon ingin mengurangi abrasi pantai. Berdasarkan informasi yang tersedia dan hasil simulasimu, rekomendasikan tindakan kebijakan yang paling tepat.\n\nJawabanmu harus memuat:\n• satu strategi utama\n• satu alasan ilmiah\n• satu dampak jangka panjang terhadap ekosistem pesisir\n\nPanduan jawaban: Rekomendasi yang kuat dapat mencakup restorasi mangrove, pembatasan alih fungsi lahan yang berdampak tinggi, dan perlindungan habitat pesisir. Jawaban juga perlu didukung bukti ilmiah, seperti abrasi yang lebih rendah, risiko banjir yang menurun, produksi ikan yang meningkat, dan penyimpanan karbon yang lebih besar.",
  },
];

// ── UNIT 7 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit7: ExamQuestion[] = [
  {
    id: 1,
    type: "open",
    question: "Researchers want to understand how social and environmental factors influence marine sustainability in coastal Cirebon.\n\nMatch each factor with its most direct effect.\n\nFactors:\n1. High fishing intensity\n2. High community awareness\n3. Good waste management\n4. Strong conservation efforts\n\nEffects:\nA. Reduces fish population\nB. Reduces overfishing behavior\nC. Improves water quality\nD. Increases marine biodiversity\n\nInstructions:\nWrite the correct matches between each factor and its effect (for example: 1–A, 2–B, etc.).",
    questionIdn: "Para peneliti ingin memahami bagaimana faktor sosial dan lingkungan memengaruhi keberlanjutan laut di wilayah pesisir Cirebon.\n\nPasangkan setiap faktor berikut dengan dampak utamanya yang paling tepat.\n\nFaktor:\n1. Intensitas penangkapan ikan tinggi\n2. Kesadaran masyarakat tinggi\n3. Pengelolaan limbah yang baik\n4. Upaya konservasi yang kuat\n\nDampak:\nA. Mengurangi populasi ikan\nB. Mengurangi perilaku penangkapan berlebih (overfishing)\nC. Meningkatkan kualitas air\nD. Meningkatkan keanekaragaman hayati laut\n\nPetunjuk:\nTuliskan pasangan yang sesuai antara faktor dan dampaknya (misalnya: 1-A, 2-B, dan seterusnya).",
  },
  {
    id: 2,
    type: "mcq",
    question: "A student sets the simulation as follows:\n• Fishing intensity: High\n• Community awareness: Low\n• Waste management: Poor\n\nThe result shows that fish population decreases strongly. Which factor most directly caused the decrease in fish population?",
    questionIdn: "Seorang siswa mengatur simulasi sebagai berikut:\n• Intensitas penangkapan ikan: Tinggi\n• Kesadaran masyarakat: Rendah\n• Pengelolaan limbah: Buruk\n\nHasil menunjukkan bahwa populasi ikan menurun secara signifikan. Faktor manakah yang paling langsung menyebabkan penurunan populasi ikan?",
    options: [
      "Poor waste management",
      "High fishing intensity",
      "Cultural traditions",
      "Water entering from the sea",
    ],
    optionsIdn: [
      "Pengelolaan limbah yang buruk",
      "Intensitas penangkapan ikan yang tinggi",
      "Tradisi budaya",
      "Air yang masuk dari laut",
    ],
    correct: "High fishing intensity",
  },
  {
    id: 3,
    type: "mcq",
    question: "In another simulation, increasing community awareness leads to improved fish population over time. Why does increasing community awareness improve fish population?",
    questionIdn: "Dalam simulasi lain, peningkatan kesadaran masyarakat menyebabkan populasi ikan meningkat seiring waktu. Mengapa peningkatan kesadaran masyarakat dapat meningkatkan populasi ikan?",
    options: [
      "It directly increases fish reproduction without changing human behavior.",
      "It reduces overfishing behavior and supports more responsible use of marine resources.",
      "It raises salinity so fish can live longer.",
      "It removes all predators from the ecosystem.",
    ],
    optionsIdn: [
      "Hal ini secara langsung meningkatkan reproduksi ikan tanpa mengubah perilaku manusia.",
      "Hal ini mengurangi perilaku penangkapan berlebih (overfishing) dan mendukung pemanfaatan sumber daya laut yang lebih bertanggung jawab.",
      "Hal ini meningkatkan salinitas sehingga ikan dapat hidup lebih lama.",
      "Hal ini menghilangkan semua predator dari ekosistem.",
    ],
    correct: "It reduces overfishing behavior and supports more responsible use of marine resources.",
  },
  {
    id: 4,
    type: "mcq",
    question: "Two coastal communities show different results:\n\nCommunity A:\n• Fishing: High\n• Awareness: Low\n• Result: Fish decline\n\nCommunity B:\n• Fishing: Medium\n• Awareness: High\n• Result: Fish stable\n\nWhich conclusion best explains the difference?",
    questionIdn: "Dua komunitas pesisir menunjukkan hasil yang berbeda:\n\nKomunitas A:\n• Penangkapan Ikan: Tinggi\n• Kesadaran: Rendah\n• Hasil: Populasi ikan menurun\n\nKomunitas B:\n• Penangkapan Ikan: Sedang\n• Kesadaran: Tinggi\n• Hasil: Populasi ikan stabil\n\nBerdasarkan data tersebut, kesimpulan manakah yang paling tepat untuk menjelaskan perbedaan tersebut?",
    options: [
      "Fishing intensity has no effect on fish population.",
      "Cultural awareness can influence fishing behavior and marine sustainability.",
      "Marine ecosystems are controlled only by natural factors.",
      "Community traditions cannot affect the environment.",
    ],
    optionsIdn: [
      "Intensitas penangkapan ikan tidak berpengaruh terhadap populasi ikan.",
      "Kesadaran budaya dapat memengaruhi perilaku penangkapan ikan dan keberlanjutan laut.",
      "Ekosistem laut hanya dikendalikan oleh faktor alam.",
      "Tradisi masyarakat tidak dapat memengaruhi lingkungan.",
    ],
    correct: "Cultural awareness can influence fishing behavior and marine sustainability.",
  },
  {
    id: 5,
    type: "mcq",
    question: "The local government in Cirebon wants to improve marine sustainability. Which strategy would be most effective based on the simulation?",
    questionIdn: "Pemerintah daerah di Cirebon ingin meningkatkan keberlanjutan laut. Strategi manakah yang paling efektif berdasarkan hasil simulasi?",
    options: [
      "Increase fishing intensity to improve short-term production.",
      "Promote Nadran together with environmental education and conservation programs.",
      "Ignore community behavior and focus only on harvesting more fish.",
      "Remove conservation rules to make fishing easier.",
    ],
    optionsIdn: [
      "Meningkatkan intensitas penangkapan ikan untuk meningkatkan produksi jangka pendek.",
      "Mempromosikan tradisi Nadran bersama dengan pendidikan lingkungan dan program konservasi.",
      "Mengabaikan perilaku masyarakat dan hanya fokus pada peningkatan hasil tangkapan ikan.",
      "Menghapus aturan konservasi agar penangkapan ikan menjadi lebih mudah.",
    ],
    correct: "Promote Nadran together with environmental education and conservation programs.",
  },
];

export const examQuestionsUnit8: ExamQuestion[] = [];
export const examQuestionsUnit9: ExamQuestion[] = [];
export const examQuestionsUnit10: ExamQuestion[] = [];

export const getQuestionsForUnit = (unit: number): ExamQuestion[] => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(`admin_questions_unit_${unit}`) : null;
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse admin questions", e);
    }
  }

  const baseQuestions: Record<number, ExamQuestion[]> = {
    1: examQuestionsUnit1,
    2: examQuestionsUnit2,
    3: examQuestionsUnit3,
    4: examQuestionsUnit4,
    5: examQuestionsUnit5,
    6: examQuestionsUnit6,
    7: examQuestionsUnit7,
    8: examQuestionsUnit8,
    9: examQuestionsUnit9,
    10: examQuestionsUnit10,
  };

  return baseQuestions[unit] || [];
};

export const examQuestions = examQuestionsUnit2;
