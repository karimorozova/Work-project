const { Languages, Vendors } = require('../../models');

const vendors = [
  {
    "Legal Name": "Somnath Dey",
    "E-mail Address": "sndey85@gmail.com",
    "Language Combinations": "EN-US » BN-IN"
  },
  {
    "Legal Name": "Luis Sosa",
    "E-mail Address": "sosa.luism01@gmail.com",
    "Language Combinations": "EN-GB » ES-419",
    "Step": "Translator",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "11/21/19"
  },
  {
    "Legal Name": "DISKUSIJA",
    "E-mail Address": "diskusija@diskusija.lt",
    "Language Combinations": "EN-GB » LT",
    "Provider Type": "Agency",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "11/21/19"
  },
  {
    "Legal Name": "PoliLingua",
    "E-mail Address": "contact@polilingua.com",
    "Language Combinations": "EN-GB » NL-BE"
  },
  {
    "Legal Name": "Danijel MerkaÅ¡",
    "E-mail Address": "danijel.merkas@outlook.com",
    "Language Combinations": "EN-GB » HR",
    "Step": "Translator"
  },
  {
    "Legal Name": "Youness Ajbilou",
    "E-mail Address": "younes_101@hotmail.fr",
    "Language Combinations": "AR » AR"
  },
  {
    "Legal Name": "Jorge Francisco Luz",
    "E-mail Address": "jorgedaluz@gmail.com",
    "Language Combinations": "EN-GB » pt-PT",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/6/20"
  },
  {
    "Legal Name": "Milan Kohút",
    "E-mail Address": "mkohut@mkohutconsulting.com",
    "Language Combinations": "EN-GB » SK",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "88",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "9/27/19"
  },
  {
    "Legal Name": "Cagdas Mandali",
    "E-mail Address": "cmandali@gmail.com",
    "Language Combinations": "de-DE » TR"
  },
  {
    "Legal Name": "Maxim Tolstov",
    "E-mail Address": "tolstovma@gmail.com",
    "Language Combinations": "EN-GB » RU"
  },
  {
    "Legal Name": "Olga Buongiorno",
    "E-mail Address": "olga.buongiorno@gmail.com",
    "Language Combinations": "fr-FR » it-IT"
  },
  {
    "Legal Name": "Kristina Korvas",
    "E-mail Address": "kristiinak89@gmail.com",
    "Language Combinations": "ET » EN-GB"
  },
  {
    "Legal Name": "Lexica",
    "E-mail Address": "info@lexika.sk",
    "Language Combinations": "EN-GB » CS"
  },
  {
    "Legal Name": "Phoneviseth Chaluenviseth",
    "E-mail Address": "chaluenviseth@gmail.com",
    "Language Combinations": "EN-GB » LO",
    "Step": "Translator",
    " Basic Price ": "  0.10 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "6/12/18"
  },
  {
    "Legal Name": "Fanny Andersson",
    "E-mail Address": "fannylinneas@gmail.com",
    "Language Combinations": "EN-GB » sv-SE",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "4/30/20"
  },
  {
    "Legal Name": "Manuela Cravotta",
    "E-mail Address": "manuela.cravotta@gmail.com",
    "Language Combinations": "de-DE » it-IT",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "68",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/21/18"
  },
  {
    "Legal Name": "Tamar Sagi",
    "E-mail Address": "tamsagi@gmail.com",
    "Language Combinations": "EN-GB » HE",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "7/31/19"
  },
  {
    "Legal Name": "Laura Crıng",
    "E-mail Address": "laura_crang@yahoo.com",
    "Language Combinations": "EN-GB » RO"
  },
  {
    "Legal Name": "Tomas Martelli",
    "E-mail Address": "tomasmartelli@googlemail.com",
    "Language Combinations": "de-DE » it-IT",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "33",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/20/18"
  },
  {
    "Legal Name": "Juan Pintado Busto",
    "E-mail Address": "titopintado@gmail.com",
    "Language Combinations": "EN-US » es-ES",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "89",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/5/20"
  },
  {
    "Legal Name": "Mari O'keefe",
    "E-mail Address": "maridympna@yahoo.fr",
    "Language Combinations": "it-IT » EN-GB",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/7/20"
  },
  {
    "Legal Name": "Nataliya Trembach",
    "E-mail Address": "hecuba1983@gmail.com",
    "Language Combinations": "EN-GB » UK",
    " Basic Price ": "  0.05 ",
    "TQI": "88",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "5/12/20"
  },
  {
    "Legal Name": "Stefanie Boehm",
    "E-mail Address": "stefanieboehm.trans@gmail.com",
    "Language Combinations": "de-DE » EN-GB"
  },
  {
    "Legal Name": "Mattias Borjesson",
    "E-mail Address": "matt.borjesson@gmail.com",
    "Language Combinations": "sv-SE » sv-SE"
  },
  {
    "Legal Name": "Ahmed Samir",
    "E-mail Address": "201ahmed@gmail.com",
    "Language Combinations": "ar-SA » EN-GB"
  },
  {
    "Legal Name": "Bora Taşdemir",
    "E-mail Address": "anatoliatranslation@gmail.com",
    "Language Combinations": "EN-GB » TR",
    "Step": "Translator"
  },
  {
    "Legal Name": "Álvaro de Marcos Peirotén",
    "E-mail Address": "alvarodemarcos@gmail.com",
    "Language Combinations": "EN-GB » es-ES",
    "Step": "Translator",
    "TQI": "94",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/16/19",
    "First Job Date": "12/18/19",
    "Last Job Date": "5/16/20"
  },
  {
    "Legal Name": "Mélanie LEHALLE",
    "E-mail Address": "mltrad@outlook.com",
    "Language Combinations": "EN-US » fr-FR"
  },
  {
    "Legal Name": "Claryssa Suci Puspa Dewi",
    "E-mail Address": "claryssa@blessed-assistance.com",
    "Language Combinations": "EN-GB » ID"
  },
  {
    "Legal Name": "Hua Zhou",
    "E-mail Address": "mojie123@hotmail.com",
    "Language Combinations": "EN-GB » zh-CN",
    "Step": "Translator"
  },
  {
    "Legal Name": "Robert Norinder",
    "E-mail Address": "robert.norinder@gmail.com",
    "Language Combinations": "sv-SE » sv-SE"
  },
  {
    "Legal Name": "Patric Tsayo",
    "E-mail Address": "patrictsayo@gmail.com",
    "Language Combinations": "EN-GB » fr-FR",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "71",
    "LQA1": "71",
    "LQA2": "82",
    "LQA3": "91",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "10/2/17",
    "First Job Date": "10/3/17",
    "Last Job Date": "5/14/20"
  },
  {
    "Legal Name": "Gardenia Zeng",
    "E-mail Address": "gardeniazh54@gmail.com",
    "Language Combinations": "EN-GB » zh-CN"
  },
  {
    "Legal Name": "Giovanni Fichera",
    "E-mail Address": "giovanni@pangea.global",
    "Language Combinations": "EN-GB » it-IT",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "84",
    "LQA1": "77",
    "LQA2": "92",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "7/5/18",
    "First Job Date": "7/9/18",
    "Last Job Date": "5/14/20"
  },
  {
    "Legal Name": "Egil Imenes",
    "E-mail Address": "egil@imenes.com",
    "Language Combinations": "EN-GB » NB",
    "Step": "Translator",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/11/19",
    "First Job Date": "12/10/19",
    "Last Job Date": "5/14/20"
  },
  {
    "Legal Name": "Aranzazu Salguero Lemaur",
    "E-mail Address": "arans@pangea-langs.com",
    "Language Combinations": "EN-GB » ES-MX"
  },
  {
    "Legal Name": "Nouri Adam",
    "E-mail Address": "nouri.adam@gmail.com",
    "Language Combinations": "EN-GB » MS",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "24",
    "LQA1": "24",
    "LQA2": "73",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/3/17",
    "First Job Date": "4/20/17",
    "Last Job Date": "5/14/20"
  },
  {
    "Legal Name": "Warangkana Wankawisan",
    "E-mail Address": "wwarangkana1990@gmail.com",
    "Language Combinations": "EN-GB » TH"
  },
  {
    "Legal Name": "Kotaro Aoki",
    "E-mail Address": "bentou06@yahoo.co.jp",
    "Language Combinations": "EN-GB » JA",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "59",
    "LQA1": "53",
    "LQA2": "-17",
    "LQA3": "90",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/3/17",
    "First Job Date": "4/28/17",
    "Last Job Date": "5/14/20"
  },
  {
    "Legal Name": "Nguyen Thanh Nga",
    "E-mail Address": "nguyenthanhnga5@gmail.com",
    "Language Combinations": "EN-GB » VI",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "LQA1": "20",
    "LQA2": "32",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/31/17",
    "First Job Date": "4/28/17",
    "Last Job Date": "5/14/20"
  },
  {
    "Legal Name": "Frederik Klingenschmid",
    "E-mail Address": "fklingenschmid@schwanenfeld.com",
    "Language Combinations": "de-DE » de-DE"
  },
  {
    "Legal Name": "Michael Remus",
    "E-mail Address": "marketing@trendsandfun.com",
    "Language Combinations": "EN-GB » de-DE",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "89",
    "LQA1": "82",
    "LQA2": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "8/22/19",
    "First Job Date": "8/23/19",
    "Last Job Date": "5/14/20"
  },
  {
    "Legal Name": "Martyna Spyra",
    "E-mail Address": "martyna.m.spyra@gmail.com",
    "Language Combinations": "EN-GB » PL"
  },
  {
    "Legal Name": "Omar Aly",
    "E-mail Address": "ogtwin@gmail.com",
    "Language Combinations": "EN-GB » AR"
  },
  {
    "Legal Name": "Isabel Valencia",
    "E-mail Address": "isabelvalmar@gmail.com",
    "Language Combinations": "EN-GB » es-ES"
  },
  {
    "Legal Name": "Alex Ahnan",
    "E-mail Address": "alex.ahnan@gmail.com",
    "Language Combinations": "EN-GB » ID"
  },
  {
    "Legal Name": "Pranchya Mruetusatorn",
    "E-mail Address": "prachya.mruetusatorn@gmail.com",
    "Language Combinations": "EN-GB » TH"
  },
  {
    "Legal Name": "Ranno Kauniste",
    "E-mail Address": "rannokau@hotmail.com",
    "Language Combinations": "EN-GB » ET",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "LQA1": "-17",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/3/17",
    "First Job Date": "4/24/17",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Rasa Damasauskaite",
    "E-mail Address": "keunenas@gmail.com",
    "Language Combinations": "EN-GB » LT",
    "Step": "Translator",
    " Basic Price ": "  0.03 ",
    "TQI": "21",
    "LQA1": "21",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "7/6/17",
    "First Job Date": "6/27/17",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Gerd Tarand",
    "E-mail Address": "gerd@gerdtarand.eu",
    "Language Combinations": "ET » EN-GB"
  },
  {
    "Legal Name": "Jakov Milicevic",
    "E-mail Address": "info@verbosari.eu",
    "Language Combinations": "EN-GB » HR",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "100",
    "LQA1": "94",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/3/17",
    "First Job Date": "5/31/17",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Desiree Davidse",
    "E-mail Address": "multi-d@live.com",
    "Language Combinations": "EN-GB » nl-NL"
  },
  {
    "Legal Name": "Antonin Gala",
    "E-mail Address": "antonin.gala@gmail.com",
    "Language Combinations": "CS » EN-GB"
  },
  {
    "Legal Name": "Deniz Giray",
    "E-mail Address": "girayturkmen@hotmail.com",
    "Language Combinations": "TR » EN-GB"
  },
  {
    "Legal Name": "Szilvia Ferenczy",
    "E-mail Address": "info@hungaro-services.com",
    "Language Combinations": "EN-GB » HU",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "100",
    "LQA1": "92",
    "LQA2": "94",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "9/27/19",
    "First Job Date": "9/27/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Duarte Bras",
    "E-mail Address": "dmdbras@gmail.com",
    "Language Combinations": "EN-GB » pt-PT"
  },
  {
    "Legal Name": "Nina Scutelnic",
    "E-mail Address": "nscutelnic@gmail.com",
    "Language Combinations": "EN-GB » RO",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "58",
    "LQA1": "0",
    "LQA2": "49",
    "LQA3": "91",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/28/17",
    "First Job Date": "4/28/17",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Matheus R. Mattos",
    "E-mail Address": "matheus.reis.mattos@hotmail.com",
    "Language Combinations": "EN-GB » pt-PT"
  },
  {
    "Legal Name": "Helena Fjellstedt Nunn",
    "E-mail Address": "kittykittyw@hotmail.com",
    "Language Combinations": "EN-GB » sv-SE"
  },
  {
    "Legal Name": "Jaru Hirsso",
    "E-mail Address": "jaru.hirsso@gmail.com",
    "Language Combinations": "FI » FI"
  },
  {
    "Legal Name": "Petar Tsanev",
    "E-mail Address": "p_tzanev@hotmail.com",
    "Language Combinations": "BG » EN-GB"
  },
  {
    "Legal Name": "Samu Lampiranta",
    "E-mail Address": "samuville.lampiranta@gmail.com",
    "Language Combinations": "FI » FI"
  },
  {
    "Legal Name": "Sara Farouk",
    "E-mail Address": "sarafarouk88@gmail.com",
    "Language Combinations": "ar-SA » EN-GB"
  },
  {
    "Legal Name": "Roman Briquet",
    "E-mail Address": "roman_briquet@hotmail.com",
    "Language Combinations": "fr-FR » fr-FR"
  },
  {
    "Legal Name": "Hakki Erdem Dincer",
    "E-mail Address": "freelanceturkish@gmail.com",
    "Language Combinations": "EN-GB » TR",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "80",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "11/23/17",
    "First Job Date": "11/25/17",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Sumie Tanaka",
    "E-mail Address": "ota.sumie@gmail.com",
    "Language Combinations": "EN-GB » JA",
    "Step": "Translator"
  },
  {
    "Legal Name": "Vasco Batalha",
    "E-mail Address": "info@vascobatalha.com",
    "Language Combinations": "EN-GB » pt-PT",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "93",
    "LQA1": "93",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "1/5/18",
    "First Job Date": "1/26/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Davide Terrana",
    "E-mail Address": "davide.terrana@live.it",
    "Language Combinations": "EN-GB » it-IT",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "94",
    "LQA1": "89",
    "LQA2": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "1/19/18",
    "First Job Date": "1/30/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Pavel Constantinov",
    "E-mail Address": "pavelconstantinov@gmail.com",
    "Language Combinations": "EN-GB » BG",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "1/26/18",
    "First Job Date": "6/12/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Matthijs den Hartog",
    "E-mail Address": "matthart@lavabit.com",
    "Language Combinations": "EN-GB » nl-NL"
  },
  {
    "Legal Name": "Mònica Muñoz Llop",
    "E-mail Address": "monicamllop@gmail.com",
    "Language Combinations": "EN-GB » es-ES",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "50",
    "LQA1": "69",
    "LQA2": "90",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/26/18",
    "First Job Date": "2/28/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "José A. Hombrados Castro",
    "E-mail Address": "jahombrados@gmail.com",
    "Language Combinations": "EN-GB » es-ES",
    "Step": "Translator"
  },
  {
    "Legal Name": "Janusz Kubow",
    "E-mail Address": "j.kubow@gmail.com",
    "Language Combinations": "PL » EN-GB"
  },
  {
    "Legal Name": "Robert Pruszczak",
    "E-mail Address": "foxlang.com@gmail.com",
    "Language Combinations": "EN-GB » PL",
    "Step": "Translator",
    " Basic Price ": "  0.03 ",
    "TQI": "89",
    "LQA1": "75",
    "LQA2": "82",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "6/20/18",
    "First Job Date": "6/26/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Gregory Kopylov",
    "E-mail Address": "gregory.kopylov@gmail.com",
    "Language Combinations": "EN-GB » RU"
  },
  {
    "Legal Name": "Nadia Anabel Cannizzaro",
    "E-mail Address": "nadiacannizzaro@gmail.com",
    "Language Combinations": "EN-GB » ES-419"
  },
  {
    "Legal Name": "Muhamed Durmic",
    "E-mail Address": "muhamed.durmic@gmail.com",
    "Language Combinations": "EN-GB » BS",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "92",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "9/30/19",
    "First Job Date": "11/7/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Sabrina Martins",
    "E-mail Address": "sabrismartins@gmail.com",
    "Language Combinations": "EN-GB » pt-BR",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "90",
    "LQA1": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "7/17/18",
    "First Job Date": "7/23/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Wagner International",
    "E-mail Address": "Kristina@wagner-international.com",
    "Language Combinations": "EN-GB » FA"
  },
  {
    "Legal Name": "David Lomidze",
    "E-mail Address": "davidlom78@gmail.com",
    "Language Combinations": "EN-GB » KA",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "85",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "8/14/18",
    "First Job Date": "8/16/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Simonas Valionis",
    "E-mail Address": "simasvalionis@gmail.com",
    "Language Combinations": "EN-GB » LT",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "76",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "8/28/18",
    "First Job Date": "8/29/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Kire Dimik Kire Dimik",
    "E-mail Address": "kiredimik@gmail.com",
    "Language Combinations": "EN-GB » MK",
    "Step": "Translator"
  },
  {
    "Legal Name": "Pelle Person",
    "E-mail Address": "textwizard@textwizard.dk",
    "Language Combinations": "EN-GB » da",
    "Step": "Translator"
  },
  {
    "Legal Name": "Christian Brandstötter",
    "E-mail Address": "office@brandstoetter.biz",
    "Language Combinations": "DE » de-DE"
  },
  {
    "Legal Name": "Johan Bergman",
    "E-mail Address": "bergman.johan@gmail.com",
    "Language Combinations": "EN-GB » sv-SE",
    "Step": "Translator",
    " Basic Price ": "  0.09 ",
    "TQI": "87",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "10/16/18",
    "First Job Date": "10/17/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Ivan Vatovic",
    "E-mail Address": "ivanvat@gmail.com",
    "Language Combinations": "EN-GB » SR-LA",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "82",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "6/19/19",
    "First Job Date": "6/19/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Hanne Jensen",
    "E-mail Address": "jensen.hanne@outlook.com",
    "Language Combinations": "EN-GB » NB",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "89",
    "LQA1": "91",
    "LQA2": "80",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "6/20/19",
    "First Job Date": "6/21/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Kathy Way",
    "E-mail Address": "kathy.waytowords@gmail.com",
    "Language Combinations": "EN-GB » fr-FR"
  },
  {
    "Legal Name": "Christian Hensen",
    "E-mail Address": "doitsu232@gmail.com",
    "Language Combinations": "EN-GB » de-DE",
    "Step": "Translator",
    "TQI": "83",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "3/9/20",
    "First Job Date": "3/9/20",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Karoline Arberg",
    "E-mail Address": "karolinearberg@yahoo.dk",
    "Language Combinations": "EN-GB » DA"
  },
  {
    "Legal Name": "Alexandra Dimitriadi",
    "E-mail Address": "a_dimitriadi@hotmail.com",
    "Language Combinations": "EN-GB » EL"
  },
  {
    "Legal Name": "Antonia Syrianou",
    "E-mail Address": "tonia_syr@hotmail.com",
    "Language Combinations": "EN-GB » EL"
  },
  {
    "Legal Name": "Agnese Šulte",
    "E-mail Address": "agnese.sulte@gmail.com",
    "Language Combinations": "EN-GB » LV",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "85",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "9/11/18",
    "First Job Date": "10/8/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Elena Mazzetto",
    "E-mail Address": "elena@localizationftw.com",
    "Language Combinations": "EN-GB » it-IT"
  },
  {
    "Legal Name": "Marianne Kjolstad Robson",
    "E-mail Address": "Marianne.robson66@gmail.com",
    "Language Combinations": "EN-GB » NB",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "60",
    "LQA1": "60",
    "LQA2": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/31/17",
    "First Job Date": "4/24/17",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Le Nguyen Quynh",
    "E-mail Address": "duongquanthu169@gmail.com",
    "Language Combinations": "EN-GB » VI",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "93",
    "LQA1": "69",
    "LQA2": "61",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "7/12/18",
    "First Job Date": "7/12/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Takashi Kimura",
    "E-mail Address": "breakfree116@yahoo.co.jp",
    "Language Combinations": "EN-GB » JA"
  },
  {
    "Legal Name": "Dung Pham",
    "E-mail Address": "jun.ptkd@gmail.com",
    "Language Combinations": "EN-GB » VI",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "82",
    "LQA1": "100",
    "LQA2": "90",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "8/30/19",
    "First Job Date": "9/10/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Tim Goossens",
    "E-mail Address": "tim.g.goossens@gmail.com",
    "Language Combinations": "EN-GB » nl-NL",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "92",
    "LQA1": "52",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "9/18/19",
    "First Job Date": "9/18/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Jan Kovačič",
    "E-mail Address": "jankovacic@ogma-translations.com",
    "Language Combinations": "EN-GB » SL",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "88",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "10/14/19",
    "First Job Date": "10/24/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Ivan Nedeljkovic",
    "E-mail Address": "no1sia@hotmail.com",
    "Language Combinations": "EN-GB » BS",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "93",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "10/18/19",
    "First Job Date": "5/13/20",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Gloria Vitoria García",
    "E-mail Address": "gloriavitge@gmail.com",
    "Language Combinations": "es-ES » es-ES"
  },
  {
    "Legal Name": "Petr Hrabe",
    "E-mail Address": "petr.hrabe@windowslive.com",
    "Language Combinations": "EN-GB » CS",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "100",
    "LQA1": "79",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "11/4/19",
    "First Job Date": "12/4/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Mehmet Öztan",
    "E-mail Address": "mehmettranslations@gmail.com",
    "Language Combinations": "EN-GB » TR",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "82",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/2/19",
    "First Job Date": "12/4/19",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Christian Wally",
    "E-mail Address": "christian.wally1982@gmail.com",
    "Language Combinations": "EN-GB » de-DE"
  },
  {
    "Legal Name": "Dmytro Dobryanskiy",
    "E-mail Address": "dmitry.dobriansky@gmail.com",
    "Language Combinations": "RU » RU"
  },
  {
    "Legal Name": "Elodie Bourry",
    "E-mail Address": "ebourry@gmail.com",
    "Language Combinations": "EN-GB » fr-FR",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/3/20",
    "First Job Date": "3/5/20",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Carolane De Palmas",
    "E-mail Address": "carolane.dpalmas@gmail.com",
    "Language Combinations": "EN-GB » fr-FR"
  },
  {
    "Legal Name": "Salvatore Guarna",
    "E-mail Address": "guarna.sal@gmail.com",
    "Language Combinations": "EN-GB » it-IT",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "93",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/6/20",
    "First Job Date": "2/10/20",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Susanne Schoof",
    "E-mail Address": "susanne.schoof@gmail.com",
    "Language Combinations": "EN-GB » de-DE",
    "Step": "Translator",
    "TQI": "89/95",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/30/20",
    "First Job Date": "5/12/20",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Fedja Imamovic",
    "E-mail Address": "imamovic.fedja@gmail.com",
    "Language Combinations": "EN-GB » HR",
    "Step": "Translator",
    "TQI": "94/89",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/13/20",
    "First Job Date": "3/18/20",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Abida Muttaqiena",
    "E-mail Address": "a.muttaqiena@gmail.com",
    "Language Combinations": "EN-GB » ID"
  },
  {
    "Legal Name": "Kian Korki",
    "E-mail Address": "Kian.a.korki@gmail.com",
    "Language Combinations": "EN-GB » sv-SE",
    "Step": "Translator"
  },
  {
    "Legal Name": "Tsiuri Pilauri",
    "E-mail Address": "silvia-gogo@hotmail.com",
    "Language Combinations": "EN-GB » KA",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "94",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "8/23/18",
    "First Job Date": "10/8/18",
    "Last Job Date": "5/13/20"
  },
  {
    "Legal Name": "Carina Reisenhofer",
    "E-mail Address": "carina.reisenhofer@me.com",
    "Language Combinations": "EN-GB » de-DE",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "4/28/20",
    "First Job Date": "5/4/20",
    "Last Job Date": "5/12/20"
  },
  {
    "Legal Name": "SYNERGIUM",
    "E-mail Address": "gerda.gudeliene@synergium.eu",
    "Language Combinations": "EN-GB » DA"
  },
  {
    "Legal Name": "Lee Anne",
    "E-mail Address": "rrr870928@gmail.com",
    "Language Combinations": "EN-GB » KO"
  },
  {
    "Legal Name": "Borbala Kemeny",
    "E-mail Address": "borbalakemeny@gmail.com",
    "Language Combinations": "es-ES » HU"
  },
  {
    "Legal Name": "Sikarnt Skoolisariyaporn",
    "E-mail Address": "dorepapa@gmail.com",
    "Language Combinations": "EN-GB » TH"
  },
  {
    "Legal Name": "Mihai Parjol",
    "E-mail Address": "mihaiparjol@yahoo.com",
    "Language Combinations": "EN-GB » RO",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/2/19",
    "First Job Date": "12/3/19",
    "Last Job Date": "5/12/20"
  },
  {
    "Legal Name": "Lenka Skolnikova",
    "E-mail Address": "lenka.skolnikova@outlook.sk",
    "Language Combinations": "EN-GB » SK",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "95",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/3/17",
    "First Job Date": "6/15/18",
    "Last Job Date": "5/12/20"
  },
  {
    "Legal Name": "Ondrej SEMERAK",
    "E-mail Address": "ondrej.semerak@sciencespo.fr",
    "Language Combinations": "CS » EN-GB"
  },
  {
    "Legal Name": "Thor Penthin Grumløse",
    "E-mail Address": "thor.localization@gmail.com",
    "Language Combinations": "EN-GB » DA",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "92",
    "LQA1": "51",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "7/7/19",
    "First Job Date": "7/8/19",
    "Last Job Date": "5/12/20"
  },
  {
    "Legal Name": "Miro Hämäläinen",
    "E-mail Address": "miro_kani@hotmail.com",
    "Language Combinations": "EN-GB » FI",
    "Step": "Translator",
    "TQI": "82",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/10/20",
    "First Job Date": "2/11/20",
    "Last Job Date": "5/12/20"
  },
  {
    "Legal Name": "Madara Miezīte",
    "E-mail Address": "miezite.madara@gmail.com",
    "Language Combinations": "EN-GB » LV",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "85",
    "LQA1": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "9/20/18",
    "First Job Date": "10/5/18",
    "Last Job Date": "5/12/20"
  },
  {
    "Legal Name": "CCKJ",
    "E-mail Address": "joan.pang@ccjk.com",
    "Language Combinations": "EN-GB » JA"
  },
  {
    "Legal Name": "Naho Miyamoto",
    "E-mail Address": "soynaho@yahoo.co.jp",
    "Language Combinations": "EN-GB » JA",
    "Step": "Translator",
    " Basic Price ": "  0.09 ",
    "TQI": "78",
    "LQA1": "78",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "3/8/19",
    "First Job Date": "3/8/19",
    "Last Job Date": "5/12/20"
  },
  {
    "Legal Name": "Laurie Drai",
    "E-mail Address": "drailaurie@hotmail.com",
    "Language Combinations": "EN-GB » fr-FR",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "87",
    "LQA1": "90",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "7/12/18",
    "First Job Date": "7/24/18",
    "Last Job Date": "5/12/20"
  },
  {
    "Legal Name": "Alina CĂLUGĂRU ",
    "E-mail Address": "calugarualinamaria@gmail.com",
    "Language Combinations": "EN-GB » RO",
    "Step": "Translator",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/19/19",
    "First Job Date": "12/23/19",
    "Last Job Date": "5/12/20"
  },
  {
    "Legal Name": "Keren Ng",
    "E-mail Address": "keren.ng@outlook.com",
    "Language Combinations": "EN-GB » ZH-TW",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "76",
    "LQA1": "39",
    "LQA2": "39",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "11/23/17",
    "First Job Date": "11/27/17",
    "Last Job Date": "5/11/20"
  },
  {
    "Legal Name": "Genadijs Lefands",
    "E-mail Address": "glefands@gmail.com",
    "Language Combinations": "EN-GB » RU",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "95",
    "LQA1": "100",
    "LQA2": "66",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "6/22/18",
    "First Job Date": "6/27/18",
    "Last Job Date": "5/11/20"
  },
  {
    "Legal Name": "Andrew Mort",
    "E-mail Address": "andrewmort77@gmail.com",
    "Language Combinations": "HE » EN-GB"
  },
  {
    "Legal Name": "Christina Kafoe",
    "E-mail Address": "info@yellbellinteractive.nl",
    "Language Combinations": "EN-GB » nl-NL",
    "Step": "Translator",
    "TQI": "82",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "11/22/19",
    "First Job Date": "11/25/19",
    "Last Job Date": "5/11/20"
  },
  {
    "Legal Name": "Magdalena Keitz",
    "E-mail Address": "magdakeitz@yahoo.com",
    "Language Combinations": "PL » EN-GB"
  },
  {
    "Legal Name": "Baki",
    "E-mail Address": "hajeeazli@gmail.com",
    "Language Combinations": "EN-GB » MS",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "86",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "11/22/19",
    "First Job Date": "12/10/19",
    "Last Job Date": "5/11/20"
  },
  {
    "Legal Name": "Yurena SanchezCastro",
    "E-mail Address": "yurena.sanchez.89@gmail.com",
    "Language Combinations": "EN-GB » es-ES",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/31/17",
    "First Job Date": "5/1/17",
    "Last Job Date": "5/11/20"
  },
  {
    "Legal Name": "Samreen Hamzah",
    "E-mail Address": "samreenhamzah39@gmail.com",
    "Language Combinations": "EN-GB » HI",
    "Step": "Translator",
    " Basic Price ": "  0.02 ",
    "TQI": "89",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "9/5/19",
    "First Job Date": "9/18/19",
    "Last Job Date": "5/11/20"
  },
  {
    "Legal Name": "Vanessa Duarte Silveira",
    "E-mail Address": "vaneduarte@hotmail.com",
    "Language Combinations": "EN-GB » pt-BR",
    "Step": "Translator",
    " Basic Price ": "  0.03 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/5/20",
    "First Job Date": "2/11/20",
    "Last Job Date": "5/11/20"
  },
  {
    "Legal Name": "Amy Kim",
    "E-mail Address": "amykim1006@gmail.com",
    "Language Combinations": "EN-GB » KO",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "56",
    "LQA1": "56",
    "LQA2": "38",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "1/16/18",
    "First Job Date": "12/13/17",
    "Last Job Date": "5/10/20"
  },
  {
    "Legal Name": "Possawee Nateetaweesak",
    "E-mail Address": "possawee.n@gmail.com",
    "Language Combinations": "EN-GB » TH",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "83",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "10/24/19",
    "First Job Date": "11/14/19",
    "Last Job Date": "5/10/20"
  },
  {
    "Legal Name": "Karen Wu",
    "E-mail Address": "xiaoyan22@hotmail.com",
    "Language Combinations": "EN-GB » ZH-TW"
  },
  {
    "Legal Name": "Ayşe Kıvılcım Karazor",
    "E-mail Address": "ayse.kivilcim@hotmail.com",
    "Language Combinations": "EN-GB » TR"
  },
  {
    "Legal Name": "Translated.net",
    "E-mail Address": "giulia@translated.net",
    "Language Combinations": "EN-GB » sv-SE"
  },
  {
    "Legal Name": "Dheeraj Dhawan",
    "E-mail Address": "knowledgeverse@gmail.com",
    "Language Combinations": "EN-GB » HI",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "68",
    "LQA1": "68",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "8/23/17",
    "First Job Date": "8/26/17",
    "Last Job Date": "5/8/20"
  },
  {
    "Legal Name": "Claudia Langreiter",
    "E-mail Address": "claudialangreiter.translator@gmail.com",
    "Language Combinations": "EN-GB » HU",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "10/2/19",
    "First Job Date": "10/4/19",
    "Last Job Date": "5/8/20"
  },
  {
    "Legal Name": "Marianna Chatzigianni",
    "E-mail Address": "marianna@pangea.global",
    "Language Combinations": "EL » EN-GB"
  },
  {
    "Legal Name": "Raluca Stanculet",
    "E-mail Address": "raluca.stanculet@gmail.com",
    "Language Combinations": "it-IT » RO"
  },
  {
    "Legal Name": "Hana Abusedu",
    "E-mail Address": "hanaabusedu@gmail.com",
    "Language Combinations": "EN-GB » ar-SA",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "90",
    "LQA1": "90",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "11/16/17",
    "First Job Date": "11/25/17",
    "Last Job Date": "5/8/20"
  },
  {
    "Legal Name": "Katalin Abrudan",
    "E-mail Address": "abtranslations1@gmail.com",
    "Language Combinations": "EN-GB » HU",
    "Step": "Translator",
    " Basic Price ": "  0.10 ",
    "LQA1": "94",
    "LQA2": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/31/17",
    "First Job Date": "4/28/17",
    "Last Job Date": "5/8/20"
  },
  {
    "Legal Name": "Cecilia Chicu",
    "E-mail Address": "cecilia.chicu@gmail.com",
    "Language Combinations": "EN-GB » RO",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "90",
    "LQA1": "93",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "5/5/17",
    "First Job Date": "5/8/17",
    "Last Job Date": "5/7/20"
  },
  {
    "Legal Name": "Isamu Kobayashi",
    "E-mail Address": "utilize20words@gmail.com",
    "Language Combinations": "JA » JA"
  },
  {
    "Legal Name": "Fernanda Meyer Pereira",
    "E-mail Address": "femeyer@gmail.com",
    "Language Combinations": "EN-GB » pt-BR"
  },
  {
    "Legal Name": "Dario Di Franco",
    "E-mail Address": "difrancodd@gmail.com",
    "Language Combinations": "EN-GB » ES-MX"
  },
  {
    "Legal Name": "Théotime MILVOY",
    "E-mail Address": "theotime.milvoy@gmail.com",
    "Language Combinations": "EN-GB » fr-FR"
  },
  {
    "Legal Name": "Satyam Varma",
    "E-mail Address": "satyamvarma@gmail.com",
    "Language Combinations": "EN-GB » HI",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "62",
    "LQA1": "62",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/20/17",
    "First Job Date": "12/22/17",
    "Last Job Date": "5/5/20"
  },
  {
    "Legal Name": "Chiara Santoriello",
    "E-mail Address": "chiara.santoriello@cmtraduzioni.com",
    "Language Combinations": "it-IT » it-IT"
  },
  {
    "Legal Name": "Catherine Johnson",
    "E-mail Address": "CATHERINE@catherine-johnson.co.uk",
    "Language Combinations": "es-ES » EN-GB"
  },
  {
    "Legal Name": "Diego Sibilia",
    "E-mail Address": "diego.sibilia@hotmail.it",
    "Language Combinations": "EN-GB » it-IT"
  },
  {
    "Legal Name": "Transhome",
    "E-mail Address": "europe@thetranshome.com",
    "Language Combinations": "EN-GB » FA",
    "Provider Type": "Agency",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/30/20",
    "First Job Date": "4/30/20",
    "Last Job Date": "5/4/20"
  },
  {
    "Legal Name": "Navarut Yenprasert",
    "E-mail Address": "navarut_y@yahoo.com",
    "Language Combinations": "EN-GB » TH",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "80",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "9/18/18",
    "First Job Date": "11/2/18",
    "Last Job Date": "4/29/20"
  },
  {
    "Legal Name": "Manasnit Klinkul",
    "E-mail Address": "manasnit123@gmail.com",
    "Language Combinations": "EN-GB » TH",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "6/1/17",
    "First Job Date": "4/24/17",
    "Last Job Date": "4/29/20"
  },
  {
    "Legal Name": "Gina Ferlisi",
    "E-mail Address": "vferlisi@msn.com",
    "Language Combinations": "EN-GB » it-IT",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/27/19",
    "First Job Date": "12/30/19",
    "Last Job Date": "4/29/20"
  },
  {
    "Legal Name": "Quelba Santos (new)",
    "E-mail Address": "Quelba@gmail.com",
    "Language Combinations": "EN-GB » pt-BR",
    "Step": "Translator",
    "LQA1": "-4",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/17/20",
    "First Job Date": "3/20/20",
    "Last Job Date": "4/28/20"
  },
  {
    "Legal Name": "Hever Translations",
    "E-mail Address": "heverpm@hevertranslations.com",
    "Language Combinations": "HE » EN-GB"
  },
  {
    "Legal Name": "Anastasia Shugusheva",
    "E-mail Address": "anastasia.shugusheva@gmail.com",
    "Language Combinations": "EN-GB » RU",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "90",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "10/5/18",
    "First Job Date": "10/8/18",
    "Last Job Date": "4/27/20"
  },
  {
    "Legal Name": "Palex",
    "E-mail Address": "pangea@palex.ru",
    "Language Combinations": "EN-GB » RU"
  },
  {
    "Legal Name": "Violaine Courbon",
    "E-mail Address": "vcourbon@lilo.org",
    "Language Combinations": "EN-GB » fr-FR",
    "Step": "Translator"
  },
  {
    "Legal Name": "Gu Jun",
    "E-mail Address": "yli_am@vip.163.com",
    "Language Combinations": "EN-GB » zh-CN"
  },
  {
    "Legal Name": "Teh Kee Lim",
    "E-mail Address": "tehkeelim@gmail.com",
    "Language Combinations": "EN-GB » MS",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "93",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "10/10/18",
    "First Job Date": "10/17/18",
    "Last Job Date": "4/20/20"
  },
  {
    "Legal Name": "Tural Afandi",
    "E-mail Address": "tural.afandi@gmail.com",
    "Language Combinations": "EN-GB » AZ-LN",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/2/18",
    "First Job Date": "2/28/18",
    "Last Job Date": "4/17/20"
  },
  {
    "Legal Name": "Bojana Vujanovic",
    "E-mail Address": "bojanaw@gmail.com",
    "Language Combinations": "EN-GB » HR"
  },
  {
    "Legal Name": "Ziyan Tian",
    "E-mail Address": "sherylting@hotmail.com",
    "Language Combinations": "EN-GB » zh-CN"
  },
  {
    "Legal Name": "Ruta Slavinskaite",
    "E-mail Address": "rutos.slavinskaites@gmail.com",
    "Language Combinations": "EN-GB » LT",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "95",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "9/20/18",
    "First Job Date": "9/19/18",
    "Last Job Date": "4/16/20"
  },
  {
    "Legal Name": "Green Yoo",
    "E-mail Address": "sareumdaum@gmail.com",
    "Language Combinations": "KO » KO"
  },
  {
    "Legal Name": "André Costa",
    "E-mail Address": "costax.ac@hotmail.com",
    "Language Combinations": "EN-GB » pt-PT",
    "Step": "Translator",
    " Basic Price ": "  0.03 ",
    "TQI": "100/94",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/5/20",
    "First Job Date": "2/12/20",
    "Last Job Date": "4/16/20"
  },
  {
    "Legal Name": "Toby Houben",
    "E-mail Address": "info@to-vertaal.nl",
    "Language Combinations": "de-DE » nl-NL"
  },
  {
    "Legal Name": "Bart Meertens",
    "E-mail Address": "bart.meertens1987@gmail.com",
    "Language Combinations": "fr-FR » nl-NL"
  },
  {
    "Legal Name": "Carol-Ann Mimeault",
    "E-mail Address": "caromimeault29@gmail.com",
    "Language Combinations": "EN-GB » FR-CA",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "100/92",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/12/20",
    "First Job Date": "2/12/20",
    "Last Job Date": "4/14/20"
  },
  {
    "Legal Name": "Anni Tervonen",
    "E-mail Address": "anni.e.tervonen@gmail.com",
    "Language Combinations": "EN-GB » FI",
    "Step": "Translator"
  },
  {
    "Legal Name": "Odil Gaipnazarov",
    "E-mail Address": "odil.gaipnazarov@yahoo.com",
    "Language Combinations": "EN-GB » UZ",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "88",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "7/31/17",
    "First Job Date": "2/28/18",
    "Last Job Date": "4/10/20"
  },
  {
    "Legal Name": "Can Aydemir",
    "E-mail Address": "canaydemir5@gmail.com",
    "Language Combinations": "EN-GB » TR"
  },
  {
    "Legal Name": "Lenka Schumacher",
    "E-mail Address": "8lenka@gmail.com",
    "Language Combinations": "EN-GB » EN-GB"
  },
  {
    "Legal Name": "Liliana Pereira",
    "E-mail Address": "liliana.lipereira@gmail.com",
    "Language Combinations": "EN-GB » pt-PT"
  },
  {
    "Legal Name": "Christiane Eidam",
    "E-mail Address": "eidam@ceidam-uebersetzungen.de",
    "Language Combinations": "EN-GB » de-DE",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "89",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/10/20",
    "First Job Date": "3/11/20",
    "Last Job Date": "4/2/20"
  },
  {
    "Legal Name": "Antje Spiller",
    "E-mail Address": "Language.matters@t-online.de",
    "Language Combinations": "EN-GB » de-DE",
    "Step": "Translator",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "2/10/20",
    "First Job Date": "2/7/20",
    "Last Job Date": "3/30/20"
  },
  {
    "Legal Name": "Domenico Trimboli",
    "E-mail Address": "domenico@intoita.com",
    "Language Combinations": "it-IT » it-IT"
  },
  {
    "Legal Name": "Laura Jurinich",
    "E-mail Address": "laura.jurinich@gmail.com",
    "Language Combinations": "fr-FR » it-IT"
  },
  {
    "Legal Name": "Dana Grinbauma",
    "E-mail Address": "Dana.Grinbauma@gmail.com",
    "Language Combinations": "EN-GB » LV",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "100",
    "LQA1": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/3/17",
    "First Job Date": "4/24/17",
    "Last Job Date": "3/23/20"
  },
  {
    "Legal Name": "Michal Fabian",
    "E-mail Address": "fabian@chello.sk",
    "Language Combinations": "EN-GB » SK",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "13",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/3/17",
    "First Job Date": "10/2/18",
    "Last Job Date": "3/23/20"
  },
  {
    "Legal Name": "Tijana Dmitrović",
    "E-mail Address": "tdmitrovic@gmail.com",
    "Language Combinations": "EN-GB » HR"
  },
  {
    "Legal Name": "Biljana Bojchev",
    "E-mail Address": "biljanabojcev@gmail.com",
    "Language Combinations": "EN-GB » MK",
    "Step": "Translator",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "10/23/19",
    "First Job Date": "11/7/19",
    "Last Job Date": "3/19/20"
  },
  {
    "Legal Name": "Marta Adamiuk",
    "E-mail Address": "tlumaczenia.ma@gmail.com",
    "Language Combinations": "PL » PL"
  },
  {
    "Legal Name": "Paolo Trotta",
    "E-mail Address": "03473789743@vodafone.it",
    "Language Combinations": "EN-GB » it-IT"
  },
  {
    "Legal Name": "Clarissa Soriano",
    "E-mail Address": "mcrs_clarisse2004@yahoo.com",
    "Language Combinations": "EN-GB » TL",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/31/17",
    "First Job Date": "4/28/17",
    "Last Job Date": "3/11/20"
  },
  {
    "Legal Name": "Anne Schoendorff",
    "E-mail Address": "anneschoendorff@hotmail.com",
    "Language Combinations": "DA » DA"
  },
  {
    "Legal Name": "Natasja Engholm",
    "E-mail Address": "n.engholm@gmail.com",
    "Language Combinations": "DA » DA"
  },
  {
    "Legal Name": "Donatella Ciccimarra",
    "E-mail Address": "dciccimarra@gmail.com",
    "Language Combinations": "it-IT » EN-GB",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/22/17",
    "First Job Date": "12/11/19",
    "Last Job Date": "3/5/20"
  },
  {
    "Legal Name": "Wallace Solutions",
    "E-mail Address": "pim@wallacesolutions.net",
    "Language Combinations": "EN-GB » FI",
    "Provider Type": "Agency",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "7/4/19",
    "First Job Date": "12/23/19",
    "Last Job Date": "3/3/20"
  },
  {
    "Legal Name": "Olivia Constantinou",
    "E-mail Address": "olviam@cytanet.com.cy",
    "Language Combinations": "EL » EN-GB"
  },
  {
    "Legal Name": "Sandra Suca",
    "E-mail Address": "sandra.suca@yahoo.com",
    "Language Combinations": "EN-GB » HR",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "87",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "8/28/18",
    "First Job Date": "8/29/18",
    "Last Job Date": "2/24/20"
  },
  {
    "Legal Name": "Georgios Anagnostou",
    "E-mail Address": "anagnostou.ge@gmail.com",
    "Language Combinations": "EN-GB » EL"
  },
  {
    "Legal Name": "Hanan Edwar",
    "E-mail Address": "fanan20@gmail.com",
    "Language Combinations": "EN-GB » ar-SA",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/27/19",
    "First Job Date": "2/12/20",
    "Last Job Date": "2/17/20"
  },
  {
    "Legal Name": "Luigi Argentino",
    "E-mail Address": "luigi.argentino@gmail.com",
    "Language Combinations": "EN-GB » it-IT",
    "Step": "Translator",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "7/29/19",
    "First Job Date": "1/24/20",
    "Last Job Date": "2/13/20"
  },
  {
    "Legal Name": "Roland Jüptner",
    "E-mail Address": "roland.jueptner@email.de",
    "Language Combinations": "EN-GB » de-DE",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "8/16/19",
    "First Job Date": "2/13/20",
    "Last Job Date": "2/13/20"
  },
  {
    "Legal Name": "Carlotta Borelli",
    "E-mail Address": "carlotta.borelli12@gmail.com",
    "Language Combinations": "EN-GB » it-IT"
  },
  {
    "Legal Name": "Jana Hodson",
    "E-mail Address": "j.h.prosolutions@gmail.com",
    "Language Combinations": "EN-GB » de-DE",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "83",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "8/16/19",
    "First Job Date": "8/28/19",
    "Last Job Date": "2/5/20"
  },
  {
    "Legal Name": "Nadia AZIM",
    "E-mail Address": "nadia.azim89@gmail.com",
    "Language Combinations": "EN-GB » fr-FR",
    "Step": "Translator",
    " Basic Price ": "  0.09 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "7/29/19",
    "First Job Date": "12/19/19",
    "Last Job Date": "2/5/20"
  },
  {
    "Legal Name": "Eddy Hazoume",
    "E-mail Address": "dossourody@gmail.com",
    "Language Combinations": "EN-GB » fr-FR",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/27/19",
    "First Job Date": "12/27/19",
    "Last Job Date": "1/30/20"
  },
  {
    "Legal Name": "Carolane De Palmas",
    "E-mail Address": "cdepalmas@gmail.com",
    "Language Combinations": "EN-GB » FR"
  },
  {
    "Legal Name": "Olga Dimitrova",
    "E-mail Address": "odimitrova@yahoo.com",
    "Language Combinations": "EN-GB » BG",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/20/18",
    "First Job Date": "11/18/19",
    "Last Job Date": "1/28/20"
  },
  {
    "Legal Name": "Mari Karhunen",
    "E-mail Address": "mari.karhunen@gmail.com",
    "Language Combinations": "EN-GB » FI",
    "Step": "Translator",
    " Basic Price ": "  0.09 ",
    "TQI": "61",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/26/17",
    "First Job Date": "4/28/17",
    "Last Job Date": "1/22/20"
  },
  {
    "Legal Name": "Tom Grimaud",
    "E-mail Address": "grimaud.translation@gmail.com",
    "Language Combinations": "EN-GB » fr-FR",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "100",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "12/27/19",
    "First Job Date": "1/3/20",
    "Last Job Date": "1/17/20"
  },
  {
    "Legal Name": "David Lee",
    "E-mail Address": "dfarnswarth.55@gmail.com",
    "Language Combinations": "JA » JA"
  },
  {
    "Legal Name": "Jennifer Campos",
    "E-mail Address": "jennifer@jentranslates.com",
    "Language Combinations": "EN-GB » ES-MX"
  },
  {
    "Legal Name": "Mohamed Saeed",
    "E-mail Address": "l10n2localize@gmail.com",
    "Language Combinations": "EN-GB » ar-SA",
    "Step": "Translator",
    " Basic Price ": "  0.05 ",
    "TQI": "98",
    "LQA1": "81",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/18/19",
    "First Job Date": "4/8/19",
    "Last Job Date": "1/14/20"
  },
  {
    "Legal Name": "Jasmin Festi",
    "E-mail Address": "jasmin.festi6390@gmail.com",
    "Language Combinations": "DE » de-DE"
  },
  {
    "Legal Name": "Takeshi Suda",
    "E-mail Address": "tsuda@alumni.berklee.edu",
    "Language Combinations": "JA » EN-GB"
  },
  {
    "Legal Name": "Neyf Almeida",
    "E-mail Address": "neyf.almeida@gmail.com",
    "Language Combinations": "EN-GB » pt-BR",
    "Step": "Translator",
    "TQI": "80",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "2/6/19",
    "First Job Date": "12/18/19",
    "Last Job Date": "12/30/19"
  },
  {
    "Legal Name": "Igor Jurić (Sinonim)",
    "E-mail Address": "igor@sinonim.hr",
    "Language Combinations": "EN-GB » BS"
  },
  {
    "Legal Name": "Stanislava Tretyak",
    "E-mail Address": "tretyak13@yahoo.com",
    "Language Combinations": "EN-GB » RU",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "52",
    "LQA1": "35",
    "LQA2": "42",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "5/4/17",
    "First Job Date": "4/27/17",
    "Last Job Date": "12/19/19"
  },
  {
    "Legal Name": "Theis Jensen",
    "E-mail Address": "theisduelund@gmail.com",
    "Language Combinations": "EN-GB » DA"
  },
  {
    "Legal Name": "Turklingua Turkish Translation Agency",
    "E-mail Address": "rkuhn@turklingua.com",
    "Language Combinations": "EN-GB » TR",
    " Basic Price ": "  0.05 ",
    "Provider Type": "Agency",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "8/23/19",
    "First Job Date": "12/9/19",
    "Last Job Date": "12/9/19"
  },
  {
    "Legal Name": "Emanuel Stroia",
    "E-mail Address": "emil.stroia@gmail.com",
    "Language Combinations": "EN-GB » RO"
  },
  {
    "Legal Name": "Zuzana Suchá",
    "E-mail Address": "zuza.sucha@gmail.com",
    "Language Combinations": "es-ES » CS"
  },
  {
    "Legal Name": "Maurizio Varriale",
    "E-mail Address": "mavarriale@gmail.com",
    "Language Combinations": "EN-GB » it-IT"
  },
  {
    "Legal Name": "Marcus Voller",
    "E-mail Address": "marcus@voller-translations.com",
    "Language Combinations": "EN-GB » de-DE",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "97",
    "LQA1": "74",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/26/19",
    "First Job Date": "3/28/19",
    "Last Job Date": "11/26/19"
  },
  {
    "Legal Name": "Altanbayar Aldar",
    "E-mail Address": "altka2020@gmail.com",
    "Language Combinations": "EN-GB » MN",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "9/18/19",
    "First Job Date": "9/17/19",
    "Last Job Date": "11/22/19"
  },
  {
    "Legal Name": "Dave Bindon",
    "E-mail Address": "dave@bindontranslations.com",
    "Language Combinations": "EL » EN-GB",
    "Step": "Translator",
    " Basic Price ": "  0.09 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "5/26/17",
    "First Job Date": "5/26/17",
    "Last Job Date": "11/19/19"
  },
  {
    "Legal Name": "Georgia Nicolaides",
    "E-mail Address": "georgia.nicolaides@gmail.com",
    "Language Combinations": "EN-GB » EL",
    "Step": "Translator",
    "Provider Type": "PIO",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "11/13/19",
    "First Job Date": "11/13/19",
    "Last Job Date": "11/15/19"
  },
  {
    "Legal Name": "Eric Hernandez",
    "E-mail Address": "lampedusa5457@gmail.com",
    "Language Combinations": "EN-GB » TL",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "88",
    "Provider Type": "Pangea",
    "Signed: Contract": "Yes",
    "Signed: NDA": "Yes",
    "First Contact Date": "10/2/18",
    "First Job Date": "10/2/18",
    "Last Job Date": "11/13/19"
  },
  {
    "Legal Name": "Daniela Onuh (Technidok)",
    "E-mail Address": "daniela.onuh@technidok.cz",
    "Language Combinations": "EN-GB » HR"
  },
  {
    "Legal Name": "Alkemist",
    "E-mail Address": "marija.jestric@alkemist.rs",
    "Language Combinations": "EN-GB » SL"
  },
  {
    "Legal Name": "Ricky Tevet",
    "E-mail Address": "Ricki.r813@gmail.com",
    "Language Combinations": "HE » EN-GB"
  },
  {
    "Legal Name": "Hyeongmin Jeon",
    "E-mail Address": "hmnjeon@gmail.com",
    "Language Combinations": "EN-GB » KO",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "79",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/5/18",
    "First Job Date": "9/4/19",
    "Last Job Date": "10/29/19"
  },
  {
    "Legal Name": "Jihye Kim",
    "E-mail Address": "kim906564@gmail.com",
    "Language Combinations": "EN-GB » KO",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "86",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "10/8/19",
    "First Job Date": "10/24/19",
    "Last Job Date": "10/24/19"
  },
  {
    "Legal Name": "Maital Ben-Baruch",
    "E-mail Address": "maital@legaltranslations.co.il",
    "Language Combinations": "EN-GB » HE"
  },
  {
    "Legal Name": "Saqib Ali Haider",
    "E-mail Address": "zemomin@yahoo.com",
    "Language Combinations": "EN-GB » UR",
    "Step": "Translator",
    " Basic Price ": "  0.02 ",
    "TQI": "84",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "9/13/17",
    "First Job Date": "1/26/18",
    "Last Job Date": "10/18/19"
  },
  {
    "Legal Name": "Markus Sammer",
    "E-mail Address": "markus.sammer@outlook.com",
    "Language Combinations": "EN-GB » de-DE"
  },
  {
    "Legal Name": "Maria Dimitrova",
    "E-mail Address": "m.b.ilieva@gmail.com",
    "Language Combinations": "EN-GB » BG"
  },
  {
    "Legal Name": "Ida Louise Vejlstrup",
    "E-mail Address": "ilmgv90@gmail.com",
    "Language Combinations": "EN-GB » DA",
    "Step": "Translator",
    " Basic Price ": "  0.09 ",
    "TQI": "0",
    "LQA1": "0",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "7/19/17",
    "First Job Date": "7/19/17",
    "Last Job Date": "6/4/19"
  },
  {
    "Legal Name": "Ryutaro Yamashita",
    "E-mail Address": "ryu1so4anko@gmail.com",
    "Language Combinations": "EN-GB » JA"
  },
  {
    "Legal Name": "Stephen Young",
    "E-mail Address": "stephen.sachiko.young@gmail.com",
    "Language Combinations": "JA » EN-GB",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "TQI": "50",
    "LQA1": "50",
    "LQA2": "-13",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/20/18",
    "First Job Date": "3/21/18",
    "Last Job Date": "5/17/19"
  },
  {
    "Legal Name": "Milena Ferrante",
    "E-mail Address": "milenaferrante@hotmail.com",
    "Language Combinations": "EN-GB » it-IT",
    "Step": "Translator",
    " Basic Price ": "  0.06 ",
    "TQI": "63",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/23/18",
    "First Job Date": "6/12/18",
    "Last Job Date": "4/23/19"
  },
  {
    "Legal Name": "Sain Alizada",
    "E-mail Address": "baku@kvaloynettverk.com",
    "Language Combinations": "EN-GB » TK",
    " Basic Price ": "  0.06 ",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/21/18",
    "First Job Date": "3/28/18",
    "Last Job Date": "4/19/19"
  },
  {
    "Legal Name": "Omar Mear",
    "E-mail Address": "omarmear2@gmail.com",
    "Language Combinations": "EN-GB » BN-IN"
  },
  {
    "Legal Name": "Patrick Kivirikko",
    "E-mail Address": "patrick.kivirikko@gmail.com",
    "Language Combinations": "EN-GB » FI"
  },
  {
    "Legal Name": "Expertrans",
    "E-mail Address": "emma@expertrans.com",
    "Language Combinations": "EN-GB » JA",
    "Provider Type": "Agency",
    "Signed: Contract": "No",
    "Signed: NDA": "Yes",
    "First Contact Date": "2/19/19",
    "First Job Date": "3/11/19",
    "Last Job Date": "3/12/19"
  },
  {
    "Legal Name": "Samid Vahidov",
    "E-mail Address": "samidvahid@gmail.com",
    "Language Combinations": "EN-GB » AZ-LN",
    "Step": "Translator",
    " Basic Price ": "  0.03 ",
    "TQI": "73",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/2/18",
    "First Job Date": "3/1/18",
    "Last Job Date": "1/21/19"
  },
  {
    "Legal Name": "Małgorzata Ligaj",
    "E-mail Address": "malgorzata.ligaj@gmail.com",
    "Language Combinations": "EN-GB » PL"
  },
  {
    "Legal Name": "Fahimeh Sanati",
    "E-mail Address": "fahimeh@farsiconnect.com",
    "Language Combinations": "EN-GB » FA",
    "Step": "Translator",
    " Basic Price ": "  0.08 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/31/17",
    "First Job Date": "7/4/18",
    "Last Job Date": "10/15/18"
  },
  {
    "Legal Name": "Tina Paatashvili",
    "E-mail Address": "tina.paatashvili@gmail.com",
    "Language Combinations": "EN-GB » RU"
  },
  {
    "Legal Name": "Seongjin Park",
    "E-mail Address": "spark@outlook.kr",
    "Language Combinations": "EN-GB » KO",
    "Step": "Translator",
    " Basic Price ": "  0.07 ",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "4/3/17",
    "First Job Date": "4/24/17",
    "Last Job Date": "6/21/18"
  },
  {
    "Legal Name": "Margus Enno",
    "E-mail Address": "margus@antenna.ee",
    "Language Combinations": "EN-GB » ET",
    " Basic Price ": "  0.07 ",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/28/18",
    "First Job Date": "6/13/18",
    "Last Job Date": "6/15/18"
  },
  {
    "Legal Name": "Gino Toti",
    "E-mail Address": "gino@wagner-international.com",
    "Language Combinations": "EN-GB » KA",
    " Basic Price ": "  0.08 ",
    "Provider Type": "Agency",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "6/1/18",
    "First Job Date": "6/1/18",
    "Last Job Date": "6/12/18"
  },
  {
    "Legal Name": "Seulki Lee",
    "E-mail Address": "writingslee@gmail.com",
    "Language Combinations": "EN-GB » KO"
  },
  {
    "Legal Name": "Saibal Ray",
    "E-mail Address": "saibal.r2009@gmail.com",
    "Language Combinations": "EN-GB » BN-IN",
    "Step": "Translator",
    " Basic Price ": "  0.04 ",
    "TQI": "74",
    "Provider Type": "Pangea",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "3/2/18",
    "First Job Date": "2/28/18",
    "Last Job Date": "5/2/18"
  },
  {
    "Legal Name": "Lee-at Maskowitz",
    "E-mail Address": "lmaskowitz@linguistit.com",
    "Language Combinations": "HE » EN-GB",
    " Basic Price ": "  0.10 ",
    "Signed: Contract": "No",
    "Signed: NDA": "No",
    "First Contact Date": "11/23/17",
    "First Job Date": "11/23/17",
    "Last Job Date": "1/7/18"
  }
];

async function updateVendors() {
  for (let vendor of vendors) {
    const firstName = vendor['Legal Name'].split(' ')[0];
    const surname = vendor['Legal Name'].split(' ').slice(1).join(' ');
    const langCombinations = vendor['Language Combinations'].split(' » ');
    const source = await Languages.findOne({symbol: langCombinations[0].toUpperCase()}, { _id: 1 });
    const target = await Languages.findOne({symbol: langCombinations[1].toUpperCase()}, { _id: 1 });
    const languagePairs = [{ source: source._id, target: target._id }];
    const basicRate = vendor[' Basic Price '] || '';
    const newVendor = {
      firstName,
      surname,
      email: vendor['E-mail Address'],
      basicRate,
      languagePairs,
      tqi: vendor['TQI'] || '',
      password: '$2y$10$ib7rCAFde4/X.QF5WbQ7hORXb.CERBjZ80FBUSqobr2U.hIyF/9Vi',
      "photo": "",
      "website": "",
      "phone": "12345678",
      "timezone": "",
      "native": ObjectId("5eb9575f3fc974212c9bb284"),
      "gender": "",
      "skype": "",
      "companyName": "",
      "linkedin": "",
      "whatsapp": "",
      "experienceYears": "",
      "availability": "",
      "catExperience": "",
      "internetAccess": "Yes",
      "softwares": [],
      "documents": [],
      "profExperiences": [],
      "educations": [],
      "industries": [
        ObjectId("5eb9575f3fc974212c9bb2ca")
      ],
      "positions": [],
      "isTest": false,
      "matrix": {
        "xTranslated": {
          "text": "X translated",
          "rate": 0.1
        },
        "repeat": {
          "text": "Repetition",
          "rate": 0.2
        },
        "contextMatch": {
          "text": "Context match",
          "value": 0.2
        },
        "repeat100": {
          "text": "100%",
          "rate": 0.2
        },
        "repeat50": {
          "text": "50-74%",
          "rate": 1
        },
        "repeat75": {
          "text": "75-84%",
          "rate": 0.8
        },
        "repeat85": {
          "text": "85-94%",
          "rate": 0.6
        },
        "repeat95": {
          "text": "95-99%",
          "rate": 0.25
        },
        "noMatch": {
          "text": "No match",
          "rate": 1
        }
      },
      "cvFiles": [],
      "coverLetterFiles": [],
      "wordsRates": [],
      "qualifications": [],
      "assessments": [],
      "monoRates": [],
      "hoursRates": [],
    };
    await Vendors.insertOne(newVendor);
  }
}

module.exports = updateVendors;
