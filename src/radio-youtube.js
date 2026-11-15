// Pesme za YouTube stanice Beep Beep radija: zvanični spotovi (ID snimka sa YouTube-a).
// Svaki slušalac dobija pesme izmešane, a ako neki snimak nestane sa YouTube-a, radio ga sam preskoči.
// Pesma se dodaje ili menja tako što se ovde upiše ID iz adrese snimka (youtube.com/watch?v=OVO).

// Moderna: novi domaći pop, rep, trep i zabavni hitovi
export const MODERNA = [
  'WxbiTUeh8hM', // Devito - Ego
  'CaD6vl7QEqg', // Nucci - Hilton Hotel Barça
  'UjR2j2Rrkt0', // Rasta - Tajland
  'hOM-KIKxtIY', // Devito - Amsterdam
  'qegSEizWL24', // Nikolija x Biba - MDMA
  'ANewJecVYI8', // MC Stojan feat. Viki Eftimova - Emirati
  '8pjgzO-4STw', // Teodora feat. Jala Brat - 101 zmija
  'hl9JlRy_I-U', // Devito x Bajaga - Astronaut
  'ghQcsM4-Rww', // Breskvica & Saša Matić - Sneg
  '1C6M4kCroPw', // Voyage feat. Ceca - Muškarčina
  'UlUL9ogR4FM', // Ceca x Željko Joksimović - Više od sreće
  'vM_tj_9iO-A', // Gliga - Crveni Ferrari
  'lIwnbdAiekU', // Ksenia - Ko ja i ti
  'OUQVtxxxrxc', // Jelena Tomašević - Postelja od irisa
  'ZSGDi2HdzVI', // Sanja Vučić x Amar Gile - Oko oko
  'vpqGtwqdN_w', // DJ Mateo x Valentino - Stres
  'ONx6-Fwp4Qc', // Nucci - BeBo 4
  'XjQZ7EKWF68', // Henny ft. Dželja Ramović - Tajna veza
  '5GRwLn8Jk-4', // Sara Zinaić x Edita - Baile de gusle
  '8dlEQFVdIG4', // Anhellito - Dečko iz dijaspore
  '3jfPbfznGuc', // Sanja Vučić x Tea Tairović - Marrakesh - Dubai
  '8uLgSn3P_oE', // Alfa x Brett - Indianca
  'eokL9AO4_hY', // Željko Joksimović - Ela
  'Fq8Tuffiir0', // Cvija - Minira
  'SXCcRVvQn-s', // Breskvica x Zorana Mićanović - Crni šećer
  'Dk8NL60BOx8', // Ana Nikolić - Terasa sa pogledom na zid
  'H6JZKccfDNk', // Gazda Paja x Biba x THCF - Chat chat
  '6-gPzo7JTQQ', // MC Stojan x Zorana Mićanović - Namerno
  'd7tpYyAnopA', // Andreana Čekić - Party party
  'HND5fLEkqP0', // Breskvica - Čini
  'aRKhpLR8EgI', // Voyage - Svrati
  'IWti5VDb2-U', // Aleksandra Prijović - Dam dam dam
  'S9yKu55xjhU', // Sanja Vučić x Cvija - Kriva je kafana
  'PabNPmjAgbo', // Milica Todorović x Gazda Paja - No no no
  'Rx3_uwy9QT8', // Milica Pavlović - Venčanje
  'QUKdCqZRefs', // Devito - Koketa
  'dAX9rpstSi8', // Devito feat. Jala Brat & Buba Corelli - Vajbuje
  '8NOnN2phiMk', // Devito feat. Relja - Htela je da zna
  'ssMkC5JYbIE', // Devito feat. Breskvica - Tu tu tu
  'O-R-B-gfApk', // Devito - Nina 2.0
  '2xbWSk5x5wg', // Devito feat. Inas - Svemir
  'xf5o2CAPPyQ', // Ema - Idi mi, dođi mi
  'LhsjUnt2j-I', // Teodora - Polumesec
  'Nf3HRasThj8', // Ema ft. Albino - Tajno moja
  'm8vs8uXUewA', // Tea Tairović - Ljubavnica
  'la4qEeDDGBo', // Tea Tairović - Preterala
  'ryfNCJvyj2g', // Tea Tairović - Budalo
  'VUnbLToi0Ow', // Grše x Miach - Sante
  'lUAUdQtS_TA', // Peki feat. Vojko V - Ganga i rera
  '41cSUU2CA94', // Hiljson Mandela x Miach - Anđeo
  // dodato na zahtev: Breskvica, Jala Brat, Aleksandra Prijović, Nucci, Magla bend, Voyage, Jakov Jozinović,
  // Nenad Jovanović Blizanac i slični hitovi (zvanični spotovi sa kanala izvođača i izdavača)
  'S8NzpB-1bP8', // Breskvica - Do gole kože
  'wQcW_q6UEPc', // Breskvica - Loša
  '6vRV7UyZtwk', // Breskvica - Srećan put
  'X-UTfyUbLUw', // Henny x Breskvica - Sava i Dunav
  'kENX9selukE', // Breskvica x Teodora - Drift
  '9Khaj535GTM', // Breskvica - Lutka
  'XI0z3J-lb0s', // Breskvica - Leptir
  'Y8o3pYyKVRU', // Voyage x Breskvica - Budi tu
  '-XcdFuRFvws', // Breskvica & Peđa Jovanović - Nemoguća ljubav
  'xsHl08XSwsI', // Jala Brat & Buba Corelli - Klinka
  'oZQQhOyqeTQ', // Jala Brat & Buba Corelli ft. Senidah - Kamikaza
  'H2v1GnDmLHI', // Jala Brat ft. Coby & Buba Corelli - O.D.D.D.
  'iFhOT5hbgbU', // Jala Brat & Buba Corelli & Hava - Dale
  'jfu0TZJ_iYQ', // Jala Brat & Buba Corelli - Karantin
  'GrwRMSozywg', // Jala Brat & Hava - Noć
  'NAy-wkYDNmE', // Jala Brat & Buba Corelli & Baby it's Pablo - Padam
  'tJ9AoYacRI0', // Maya Berović feat. Jala Brat & Buba Corelli - To me radi
  'QnMhoBRnd1c', // Jala Brat & Buba Corelli - Bass
  '5SSMdCPt5-8', // Aleksandra Prijović - Sve po starom
  '6u_cgKR_D3w', // Aleksandra Prijović - Legitimno
  '-TQ63c-_uSw', // Aleksandra Prijović - Devet života
  'hor1XE7dGUE', // Aleksandra Prijović - Sabotiram
  'ks2-b3dUDKw', // Aleksandra Prijović x Dejan Kostić - Ludnica
  'bbpJhTJmsEM', // Aleksandra Prijović - Javno mesto
  'V_LwDhWBi74', // Aleksandra Prijović - Kababa
  'u1iAIwW5PBg', // Aleksandra Prijović - Sledeća
  'j2aMJdWARtI', // Aleksandra Prijović - Placebo
  '1E8lCyUjywY', // Nucci - Uđi na WA
  'CCeY-fjvrKg', // Nucci x Rasta - Ceo svet
  'Mgqr4_v1Mok', // Voyage x Nucci - Gad
  'OkVg2IvnAuw', // Tea Tairović x Nucci - TeaNucci
  'LUWCYld_zc0', // Sanja Vučić x Nucci - Ruzmarin
  'M7bEXzUEoZg', // Nucci - Dve barbike
  'e0qssWCwfHQ', // Nucci - Loro Piana
  'jSlQS1WpOGI', // Magla bend - Samo se noćas pojavi
  'leXL3XhTVUo', // Magla bend - Čini mi se
  'IguMjASTwE8', // Magla bend - Da li bi me volela
  'xwdXjk2jG1w', // Magla bend - Da Bog da
  'DHJ74LmLPKQ', // Magla bend - Suze slane
  'e48NuqIcSyM', // Magla bend & Nataša Bekvalac - Neprijatelj
  'sKLvpLQwQxQ', // Magla bend - Godinu dana
  'mP62uBRAjnk', // Magla - Krive Drine
  '9d7TDm6hvlE', // Voyage x J Fado - Plesi
  'jEzUuwqf_ZU', // Voyage - La la la
  'NVVNdEbdcFA', // Voyage x Snik - Bounce
  'MI288t_rm_I', // Voyage - Detinjstvo
  '5e0E2dvXZow', // Baka Prase x Voyage - VVS
  'xGHDoLSjvrU', // Voyage - Beograd
  'Vawi8a1PsLQ', // Jakov Jozinović - Ja volim
  'gjBzwVgRlaY', // Jakov Jozinović - Polje ruža
  'ajG_f4vND6Q', // Jakov Jozinović - Meri
  'zA0Ezbpkzrc', // Jakov Jozinović - Raj
  'UlwsYRXs61E', // Jakov Jozinović - Na mjestu mom
  'fgSkvw-nBkU', // Jakov Jozinović - Nećeš spavati
  'KApb7CdfJg0', // Nenad Jovanović Blizanac - Kuća
  'yYAS1zQrJCI', // Nenad Jovanović Blizanac - I šta sad
  'OoQP0HNJwL0', // Nenad Jovanović Blizanac - Ne pijem
  'zhu47pyXxd4', // Nenad Jovanović Blizanac - Da me voliš
  'RzSVW6bzUd4', // Peđa Jovanović - 24/7
  'niUosZLtrKk', // Peđa Jovanović - Želja
  'YK1kfICCD2I', // Peđa Jovanović - Ono nešto
  '7Ss2NdGXfmk', // Peđa Jovanović - Neformalno
]

// Folk: narodna i folk muzika
export const FOLK = [
  '2gDHBmbgQFY', // Jala Brat & Buba Corelli - Zaronim
  'v-TY9nQDKvo', // Nikola Rokvić - Svake mi se noći lumpuje
  'YHSB0_9mIfg', // Osman Hadžić - Zora mi rana
  'DfxeGe_4Aiw', // Saša Matić - Stani malo
  '6r2Y3gVROD8', // Collapse - Bosna
  'GBPnnUGLMWM', // Saša Matić - Daleko
  '2XTagCCfsMA', // Šerif Konjević - Sitni sati
  'UaClWmzSp8w', // Zorana Mićanović - Crna kafa (uživo)
  'kxt4MI_448w', // Nikola Jevtić - Cvete moj
  'BXrHsldUd8Y', // Miligram feat. Halid Bešlić - Sejda
  'RxenJrKyp70', // Nataša Bekvalac - Mama
  'bmuyDKwep-Q', // Darko Lazić - Uzmi uzmi
  'F82mfbSsbEk', // Milica Pavlović - Kolo
  '_tyeuEWUvcM', // Dino Merlin feat. Halid Bešlić - Godino vrela
  'UyjOlX3gQEY', // Oficir s ružom
  'UmkHl0NGSC8', // Mirza Selimović & Šejla Zonić - Crni snjegovi
  '2xwg6QTfgk4', // Sudbina me na put šalje
  'JYigm_QucXI', // Aca Lukas & Miroslav Ilić - Igraj, igraj sve do zore
  'R246B8CdvXE', // Nikola Ajdinović - Kralj i sluga
  'G_9GqUh_-rg', // Aca Lukas - Lopov
  '4iQaINT5elU', // DJ Alien - Deset zapovijedi
  'cSLG0ZC4GQw', // Nikola Jevtić - Zauvek kao sad
  'sYg-sE4MOpM', // Srce me je otkucalo
  'H1OiNaz9R34', // Boban Rajović - Otpisan
  'Xpe_016CSZ0', // Hari Mata Hari & Mirza Selimović - Janje
  'RaGEkWhnGFA', // Saša Miranović - Cvijetak plavi
  '6Dj7YuJNRRc', // Saša Miranović - Hana
  'Ufd9CNT_tVU', // Collapse - Kap na tvom licu
  '7kdyC7B14yk', // Teodora - Ostavljaš
  '6eJM4nv7kpk', // Ivica Šeperić - Sretan ti rođendan majko
  'E-KvNQWSLQI', // Peđa Jovanović - Espresso sa šlagom
  'L9C9WiBBeRk', // Mira - Love again
  'WPAETlxrHW4', // Rekla si mi da me voliš
  '077mI2VXqYs', // Zoran Simeunović Zoca - Stare cipele
  '8kYpMhjmYaw', // Peđa Jovanović - Meni dajte njenu ruku
  'CoEIntjj_x4', // Sloba Radanović x Breskvica & Dejan Petrović - Olovo
  'iyglabiM-oE', // Mirza Selimović - Balada na radiju
  '7DoCNW8No48', // Aco Pejović - Ne idem kući
  'lOXv7oWPgcI', // Collapse - Dijagnoza
  'Q-VH8rE1Xnc', // Aco Pejović - Rane
  'TDVLjfpvr5I', // Saša Matić - Sviraj rode
  '1MvPBV8-ASo', // Nedeljko Bajić Baja - I za noć i za dan
  'rBb65iC1k3Q', // Rada Manojlović - Na putu do Beča
  'dnmYWOeui14', // Tanja Savić - Otac suzama mojim
  'oJmiIfUSHrM', // Tanja Savić - Pesma protiv uroka
  'vE5oIGMIRFE', // Darko Lazić feat. Zera - Prezime
  '0GyDnQyRYiA', // Emir Đulović - Jesenje kiše
  'FIoeYRjSonI', // Mile Kitić x Menil Velioski - Dom
  'HPqTZmsDoCQ', // Sinan Sakić - Ne ide
  'tsM0WWRbk9o', // Seka Aleksić - Rana
]

// Domaća zabavna: pesme iz plejliste "Beep Beep Domaća zabavna" sa kanala Beep Beep Dostava
// (youtube.com/playlist?list=PLXn4eQOqPWaE). Ta plejlista ne može da se pušta ugrađena na sajtu (YouTube greška 150),
// zato su pesme prepisane ovde; kad se plejlista promeni na YouTube-u, treba promeniti i ovaj spisak.
export const ZABAVNA = [
  'lSXqFc0dYPE', // Lexington - U srce udaraj
  'lNAIHPm9dF8', // Lexington - Dugujem ti sebe
  'KlC0R9PUY9g', // Nataša Bekvalac - Dobro moje
  'Vawi8a1PsLQ', // Jakov Jozinović - Ja volim
  'RzSVW6bzUd4', // Peđa Jovanović - 24/7
  'E31bcPr2gr8', // Lexington - Potraži me
  'Gqy8MCEZMm0', // Željko Samardžić - Baš šteta
  'bHvpgR_l1eY', // Dženan Lončarević - Dao sam ti srce
  'ghQcsM4-Rww', // Breskvica & Saša Matić - Sneg
  '93Kh8IzlXoQ', // Dženan Lončarević - Odavde do neba
  'xwdXjk2jG1w', // Magla bend - Da Bog da
  'rY1nngCSNuY', // Lexington - Donesi
  'DHJ74LmLPKQ', // Magla bend - Suze slane
  'bw10euhE--8', // Dino Merlin - Kad si rekla da me voliš
  '10hlQRAR7qA', // Tropico Band - Ne zovi me
  'Rc6_Z0-hGpo', // Lexington - Dobro da nije veće zlo
  '-YwGuojSizI', // Lexington - Cvijeće
  '5yhI2p6naMU', // Željko Joksimović - Zaboravljaš
  'PNfOp21q-V4', // Dženan Lončarević - Ludujem
  'IBrqTvmcDTQ', // Nataša Bekvalac - Gola
  'f4EjnFlqlKY', // Vlado Georgiev - Zbogom ljubavi
  'sKLvpLQwQxQ', // Magla bend - Godinu dana
  'HmyO3HkKT5g', // Vlado Georgiev - Lažljiva
  'jV2t4QyW5wg', // Dino Merlin - Sve je laž
  '5ubSStQwcKY', // Zdravko Čolić - Mjerkam te, mjerkam
  '2RYc_wny54M', // Željko Samardžić - Možda
  'WbOnTNxgmmE', // Peđa Medenica - Dođeš mi u san
  'sMngoF7_4A8', // Merlin - Nešto lijepo treba da se desi
  'VMT50KhLlRw', // Toše Proeski - Igra bez granica
  'o0vAhIu7C7Y', // Ana Nikolić - Loše ti je bilo
  'xOlV1Hb6hT0', // Magla bend - Parazit
  'VMe-zcELXNk', // Željko Samardžić - Nisi ti za male stvari
  'jSlQS1WpOGI', // Magla bend - Samo se noćas pojavi
  'lkr-5PZKl7M', // Dino Merlin - Ako me ikada sretneš
  'NDK_mvuUXtA', // Vlado Georgiev - Nisam ljubomoran
  'rBnzAU0wOZA', // Merlin - Učini mi pravu stvar
  'JTTGDw6jHcg', // Živim sad
  'sSHyJk0DZBk', // Magazin - Ljube se dobri, loši, zli
  'BT_ABqhJTD8', // Vlado Georgiev - Reci mi da znam
  'ekPsMmxSF9U', // Crvena jabuka - Ima nešto od srca do srca
  'Z9qvpO-v5UM', // Crvena jabuka - To mi radi
  'nMP7YdzqnDU', // Vlado Georgiev - Anđele
  '1LgJsR_p7VM', // Vlado Georgiev - Mi nismo mi
  'OckthFUd6_w', // Vlado Georgiev - Jedina
  'C3m4uCkltUQ', // Toše Proeski - Još i danas zamiriše trešnja
  'fIVnJ2muLZw', // Magla x Albino - Neosvojiva
  'enppGEPbi-c', // Vlado Georgiev - Žena bez imena
  'm-iuqomR9N4', // Crvena jabuka - Tamo gdje ljubav počinje
  'vUVNPpE03W4', // Vlado Georgiev - Hej ti
  '-pftdymZYEc', // Djevojka za dva minuta
  '9MvOkF2vros', // Novi fosili - Za dobra, stara vremena
  'ZplIYLBhz5Q', // Ako mi loše krene
  'GKpgiolQyxo', // Peđa Medenica - Da me neko pita
  'khrkhzmOPPk', // Aco Pejović - Sve ti dugujem
  'efgfJEyfrls', // Vlado Georgiev - Šta bi prijatelji moji
  '7TduaKhFT1Y', // Magazin - Oko moje sanjivo
  'qmoLxvtgbu4', // Vlado Georgiev - Iskreno
  'xLwwoPnjIys', // Parni valjak - Dođi
  '9-IFDdutydk', // Vlado Georgiev - Sve si mi ti
  'Id27MkeB8hE', // Vlado Georgiev - Do svitanja
  '4lWgvFQX2MM', // Oliver Dragojević - Cesarica
  'FnRB7aFUtyU', // Al Dino - I sad me po tebi poznaju
  'xsjy3KsSBwE', // Saša Kovačević - Tanana
  'leXL3XhTVUo', // Magla bend - Čini mi se
  'ZiNBoJEvyr4', // Peđa Jovanović - Moja dama
  'UOMNw9QOGa8', // Saša Kovačević - Greška
  'EwRoQ4sWgAM', // Saša Kovačević - Srećna u novoj ljubavi
  'Ds_3zGvHggk', // Saša Kovačević - Radi me lagano
  'WpJNzWmUcQA', // Saša Kovačević - Ona
  '_toF3TpIEdM', // Magla - Čuvam je
  'IguMjASTwE8', // Magla bend - Da li bi me volela
  '7P1JmlyGfOw', // Tropico Band - Libero
  'w_t1brrLOBc', // Magla bend - Za moje drugove
  'sSeJfFnBSUA', // Saša Kovačević - Idu dani
  'oLPAbntNduo', // Saša Kovačević - Kažeš ne
  'bL7J_BSVnKg', // Saša Kovačević - Moja malena
  '5N9ceTS8paM', // Hurricane - Poljupci u zoru
  '-XcdFuRFvws', // Breskvica & Peđa Jovanović - Nemoguća ljubav
  'xE_w3Rd5RLI', // Lexington - Budi
  'LB_1ICuSVPA', // Nucci ft. Emina Jahović - Sudar svetova
  'NsKMsLr5j2k', // Željko Joksimović - K'o da ne postojim
  'OjtiW5PE7yg', // Saša Kovačević - Zamalo tvoj
  'Imqcj384fJs', // Saša Kovačević - Pantera
  'ceJZOqX_blk', // Saša Kovačević - Afera
  'RSiCZpzsCvo', // Saša Kovačević - Romeo
  'xKj0-mFaN-E', // Saša Kovačević - Boje leptira
  'eUEr9HaryG0', // Saša Kovačević - Slučajno
  'chL0fSUcAmY', // Saša Kovačević - Rođendan
  'KIa54IniRvQ', // Saša Kovačević - Lapsus
  'IBlxAhVVIZ0', // Saša Kovačević - Prevarena
  'Wn7j6r5txUs', // Saša Kovačević - Rano je
  'GZVJ6XuPDo4', // Saša Kovačević - Piši propalo
  'NTclJD8LjAY', // Saša Kovačević - Bez tebe me nema
  'lwmSxM_YS3U', // Saša Kovačević - Noć do podne
  'txf8GNZYUrA', // Dženan Lončarević - Vjerujem u nas
  'BLPd_AYS4FA', // Saša Kovačević - Lažu te ljubavi
  'jf5GRJIPhZ0', // Tropico Band - Onu moju
  'voE87SAHNqA', // Breskvica - Posle nas
  'LVTACMHcomI', // Breskvica - Vampir
  'GQBKaY9PRNE', // Aleksandra Radović - Čuvam te
  'QrKLrtWi05U', // Luka Baladić - Uvek ću te voleti
  'CLNUV9bK0Sk', // Luka Baladić - Još te srce čeka
  'B6DNOmZRPpk', // Luka Baladić - U meni još živiš
  'TpDDgIHqDv0', // Luka Baladić - Nisam te preboleo
  'R73H2ZR9XSo', // Luka Baladić - Kad ljubav zaboli
  'Ga0xBC0fQ1Y', // Samo ti - Kad te imam, imam sve
  'hSox2dJ0zYs', // Ne ljutim se
  '4xWeu9_VTOU', // Ko će mene da zagrli
  '0vgGIq9iPo0', // Luka Baladić - Bez tebe
]
