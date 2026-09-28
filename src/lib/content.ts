/**
 * Demo study content for the citizenship prep prototype.
 *
 * IMPORTANT: every item here is ORIGINAL sample content written for this app.
 * Nothing here is an official IRCC exam question. Each item carries provenance
 * metadata so real, reviewed content can replace it later without UI changes.
 */

export type LangCode =
  | "en"
  | "fr"
  | "pa"
  | "ur"
  | "ar"
  | "hi"
  | "es"
  | "zh-Hans"
  | "tl";

export type TranslationStatus = "reviewed" | "machine" | "unavailable";
export type ContentStatus = "demo" | "verified-source" | "paraphrased";

export type Language = {
  code: LangCode;
  endonym: string;
  englishName: string;
  rtl?: boolean;
  /** Interface translation availability */
  ui: TranslationStatus;
  /** Study content translation availability */
  study: TranslationStatus;
};

export const LANGUAGES: Language[] = [
  { code: "en", endonym: "English", englishName: "English", ui: "reviewed", study: "reviewed" },
  { code: "fr", endonym: "Français", englishName: "French", ui: "reviewed", study: "reviewed" },
  { code: "es", endonym: "Español", englishName: "Spanish", ui: "machine", study: "machine" },
  { code: "pa", endonym: "ਪੰਜਾਬੀ", englishName: "Punjabi", ui: "unavailable", study: "machine" },
  { code: "ur", endonym: "اردو", englishName: "Urdu", rtl: true, ui: "unavailable", study: "machine" },
  { code: "ar", endonym: "العربية", englishName: "Arabic", rtl: true, ui: "unavailable", study: "machine" },
  { code: "hi", endonym: "हिन्दी", englishName: "Hindi", ui: "unavailable", study: "unavailable" },
  { code: "zh-Hans", endonym: "简体中文", englishName: "Chinese (Simplified)", ui: "unavailable", study: "unavailable" },
  { code: "tl", endonym: "Tagalog", englishName: "Tagalog", ui: "unavailable", study: "unavailable" },
];

export function getLanguage(code: LangCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]!;
}

/** A value that may be translated. `en` is always present. */
export type Localized = { en: string; fr?: string; [key: string]: string | undefined };

export function pick(value: Localized, lang: LangCode): { text: string; translated: boolean } {
  const v = value[lang];
  if (v) return { text: v, translated: lang !== "en" };
  return { text: value.en, translated: false };
}

export type SourceMeta = {
  sourceTitle: string;
  sourceUrl?: string;
  lastVerifiedAt: string;
  originalLanguage: LangCode;
  contentStatus: ContentStatus;
};

export type Section = {
  id: string;
  title: Localized;
  body: Localized[];
  vocabulary?: { term: Localized; meaning: Localized }[];
};

export type Topic = {
  id: string;
  title: Localized;
  intro: Localized;
  readingMinutes: number;
  sections: Section[];
  source: SourceMeta;
};

export type Question = {
  id: string;
  topicId: string;
  difficulty: "easy" | "medium" | "hard";
  prompt: Localized;
  options: Localized[];
  answerIndex: number;
  explanation: Localized;
  source: SourceMeta;
};

const govSource: SourceMeta = {
  sourceTitle: "Discover Canada (IRCC study guide) — paraphrased",
  sourceUrl:
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/study-guide.html",
  lastVerifiedAt: "2026-09-01",
  originalLanguage: "en",
  contentStatus: "paraphrased",
};

const demoSource: SourceMeta = {
  ...govSource,
  sourceTitle: "Original sample question written for this app",
  contentStatus: "demo",
};

export const TOPICS: Topic[] = [
  {
    id: "history",
    title: { en: "Canadian History", fr: "Histoire canadienne" },
    intro: {
      en: "From Indigenous peoples and early settlement to Confederation and modern Canada.",
      fr: "Des peuples autochtones et des premiers établissements à la Confédération et au Canada moderne.",
    },
    readingMinutes: 9,
    source: govSource,
    sections: [
      {
        id: "history-indigenous",
        title: { en: "Indigenous peoples", fr: "Peuples autochtones" },
        body: [
          {
            en: "Indigenous peoples lived across the land now called Canada for thousands of years before Europeans arrived. The Constitution recognizes three groups of Aboriginal peoples: First Nations, Métis and Inuit.",
            fr: "Les peuples autochtones vivaient sur le territoire aujourd'hui appelé Canada depuis des milliers d'années avant l'arrivée des Européens. La Constitution reconnaît trois groupes de peuples autochtones : les Premières Nations, les Métis et les Inuits.",
          },
          {
            en: "Treaties between the Crown and Indigenous nations shaped much of Canada's development, and reconciliation remains an ongoing national commitment.",
            fr: "Les traités conclus entre la Couronne et les nations autochtones ont façonné une grande partie du développement du Canada, et la réconciliation demeure un engagement national continu.",
          },
        ],
        vocabulary: [
          {
            term: { en: "Treaty", fr: "Traité" },
            meaning: {
              en: "A formal agreement, here between the Crown and an Indigenous nation.",
              fr: "Une entente officielle, ici entre la Couronne et une nation autochtone.",
            },
          },
        ],
      },
      {
        id: "history-confederation",
        title: { en: "Confederation, 1867", fr: "La Confédération, 1867" },
        body: [
          {
            en: "On July 1, 1867, the British North America Act created the Dominion of Canada with four provinces: Ontario, Quebec, Nova Scotia and New Brunswick. Sir John A. Macdonald became the first Prime Minister.",
            fr: "Le 1er juillet 1867, l'Acte de l'Amérique du Nord britannique a créé le Dominion du Canada avec quatre provinces : l'Ontario, le Québec, la Nouvelle-Écosse et le Nouveau-Brunswick. Sir John A. Macdonald est devenu le premier premier ministre.",
          },
        ],
      },
    ],
  },
  {
    id: "government",
    title: { en: "Government and Elections", fr: "Gouvernement et élections" },
    intro: {
      en: "How Canada is governed: the Crown, Parliament, elections and the three levels of government.",
      fr: "Comment le Canada est gouverné : la Couronne, le Parlement, les élections et les trois ordres de gouvernement.",
    },
    readingMinutes: 11,
    source: govSource,
    sections: [
      {
        id: "gov-parliament",
        title: { en: "Parliament", fr: "Le Parlement" },
        body: [
          {
            en: "Canada's Parliament has three parts: the Sovereign (represented by the Governor General), the Senate, and the House of Commons. Members of Parliament are elected; senators are appointed.",
            fr: "Le Parlement du Canada comporte trois parties : le Souverain (représenté par le gouverneur général), le Sénat et la Chambre des communes. Les députés sont élus; les sénateurs sont nommés.",
          },
          {
            en: "A bill becomes law after passing both chambers and receiving royal assent.",
            fr: "Un projet de loi devient loi après avoir été adopté par les deux chambres et avoir reçu la sanction royale.",
          },
        ],
      },
      {
        id: "gov-levels",
        title: { en: "Three levels of government", fr: "Les trois ordres de gouvernement" },
        body: [
          {
            en: "Federal government handles national matters such as citizenship and defence. Provincial and territorial governments handle areas such as education and health care. Municipal governments handle local services.",
            fr: "Le gouvernement fédéral s'occupe des questions nationales comme la citoyenneté et la défense. Les gouvernements provinciaux et territoriaux s'occupent de domaines comme l'éducation et la santé. Les municipalités gèrent les services locaux.",
          },
        ],
      },
    ],
  },
  {
    id: "rights",
    title: { en: "Rights and Responsibilities", fr: "Droits et responsabilités" },
    intro: {
      en: "The Charter, fundamental freedoms, and what citizens are expected to do.",
      fr: "La Charte, les libertés fondamentales et ce que l'on attend des citoyens.",
    },
    readingMinutes: 8,
    source: govSource,
    sections: [
      {
        id: "rights-charter",
        title: { en: "The Charter of Rights and Freedoms", fr: "La Charte des droits et libertés" },
        body: [
          {
            en: "The Charter, part of the Constitution since 1982, protects fundamental freedoms including freedom of conscience and religion, thought, belief, opinion and expression, peaceful assembly, and association.",
            fr: "La Charte, qui fait partie de la Constitution depuis 1982, protège des libertés fondamentales, dont la liberté de conscience et de religion, de pensée, de croyance, d'opinion et d'expression, de réunion pacifique et d'association.",
          },
        ],
      },
      {
        id: "rights-duties",
        title: { en: "Responsibilities of citizenship", fr: "Responsabilités de la citoyenneté" },
        body: [
          {
            en: "Responsibilities include obeying the law, taking responsibility for oneself and one's family, serving on a jury when called, voting in elections, helping others in the community, and protecting Canada's heritage and environment.",
            fr: "Les responsabilités comprennent le respect de la loi, la prise en charge de soi et de sa famille, le service comme juré lorsqu'on est appelé, le vote aux élections, l'entraide dans la communauté et la protection du patrimoine et de l'environnement du Canada.",
          },
        ],
      },
    ],
  },
  {
    id: "geography",
    title: { en: "Geography", fr: "Géographie" },
    intro: {
      en: "Regions, provinces, territories and capitals.",
      fr: "Régions, provinces, territoires et capitales.",
    },
    readingMinutes: 7,
    source: govSource,
    sections: [
      {
        id: "geo-regions",
        title: { en: "Regions of Canada", fr: "Les régions du Canada" },
        body: [
          {
            en: "Canada has ten provinces and three territories, grouped into five regions: the Atlantic provinces, Central Canada, the Prairie provinces, the West Coast and the Northern territories. Ottawa is the capital.",
            fr: "Le Canada compte dix provinces et trois territoires, regroupés en cinq régions : les provinces de l'Atlantique, le Centre du Canada, les provinces des Prairies, la côte Ouest et les territoires du Nord. Ottawa est la capitale.",
          },
        ],
      },
    ],
  },
  {
    id: "symbols",
    title: { en: "Canadian Symbols", fr: "Symboles canadiens" },
    intro: {
      en: "The flag, the maple leaf, the beaver, the anthem and other national symbols.",
      fr: "Le drapeau, la feuille d'érable, le castor, l'hymne et d'autres symboles nationaux.",
    },
    readingMinutes: 5,
    source: govSource,
    sections: [
      {
        id: "symbols-flag",
        title: { en: "The flag and the anthem", fr: "Le drapeau et l'hymne" },
        body: [
          {
            en: "The national flag, with its red maple leaf, was raised for the first time in 1965. 'O Canada' was proclaimed the national anthem in 1980.",
            fr: "Le drapeau national, orné de la feuille d'érable rouge, a été hissé pour la première fois en 1965. « Ô Canada » a été proclamé hymne national en 1980.",
          },
        ],
      },
    ],
  },
  {
    id: "economy",
    title: { en: "Economy and Society", fr: "Économie et société" },
    intro: {
      en: "Trade, major industries and Canada's diverse society.",
      fr: "Le commerce, les grandes industries et la diversité de la société canadienne.",
    },
    readingMinutes: 6,
    source: govSource,
    sections: [
      {
        id: "econ-industries",
        title: { en: "Main industries", fr: "Principales industries" },
        body: [
          {
            en: "Canada's economy includes service industries, manufacturing, and natural resources such as forestry, mining, energy and agriculture. Canada trades heavily with the United States.",
            fr: "L'économie canadienne comprend les industries de services, la fabrication et les ressources naturelles comme la foresterie, l'exploitation minière, l'énergie et l'agriculture. Le Canada commerce beaucoup avec les États-Unis.",
          },
        ],
      },
    ],
  },
  {
    id: "people",
    title: { en: "Important People and Events", fr: "Personnes et événements importants" },
    intro: {
      en: "Figures and moments that shaped the country.",
      fr: "Des personnes et des moments qui ont façonné le pays.",
    },
    readingMinutes: 6,
    source: govSource,
    sections: [
      {
        id: "people-milestones",
        title: { en: "Milestones", fr: "Jalons" },
        body: [
          {
            en: "Canadians served in the First and Second World Wars and in peacekeeping missions. Remembrance Day is observed on November 11.",
            fr: "Les Canadiens ont servi durant la Première et la Seconde Guerre mondiale et dans des missions de maintien de la paix. Le jour du Souvenir est observé le 11 novembre.",
          },
        ],
      },
    ],
  },
  {
    id: "becoming",
    title: { en: "Becoming a Canadian Citizen", fr: "Devenir citoyen canadien" },
    intro: {
      en: "What the process involves and what the knowledge test covers.",
      fr: "En quoi consiste le processus et ce que couvre l'examen de connaissances.",
    },
    readingMinutes: 5,
    source: govSource,
    sections: [
      {
        id: "becoming-test",
        title: { en: "The knowledge test", fr: "L'examen de connaissances" },
        body: [
          {
            en: "Applicants in the required age range take a knowledge test about Canada's history, values, institutions and symbols, and about the rights and responsibilities of citizenship. Always confirm current requirements on the official IRCC website, because rules can change.",
            fr: "Les demandeurs dans la tranche d'âge requise passent un examen de connaissances sur l'histoire, les valeurs, les institutions et les symboles du Canada, ainsi que sur les droits et responsabilités liés à la citoyenneté. Vérifiez toujours les exigences actuelles sur le site officiel d'IRCC, car les règles peuvent changer.",
          },
        ],
      },
    ],
  },
];

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    topicId: "government",
    difficulty: "easy",
    prompt: { en: "Who represents the King in Canada?", fr: "Qui représente le Roi au Canada ?" },
    options: [
      { en: "The Prime Minister", fr: "Le premier ministre" },
      { en: "The Governor General", fr: "Le gouverneur général" },
      { en: "The Chief Justice", fr: "Le juge en chef" },
      { en: "The Speaker of the Senate", fr: "Le président du Sénat" },
    ],
    answerIndex: 1,
    explanation: {
      en: "The Governor General represents the Sovereign in Canada and gives royal assent to bills.",
      fr: "Le gouverneur général représente le Souverain au Canada et accorde la sanction royale aux projets de loi.",
    },
    source: demoSource,
  },
  {
    id: "q2",
    topicId: "government",
    difficulty: "easy",
    prompt: { en: "What are the three parts of Parliament?", fr: "Quelles sont les trois parties du Parlement ?" },
    options: [
      { en: "The Sovereign, the Senate and the House of Commons", fr: "Le Souverain, le Sénat et la Chambre des communes" },
      { en: "The Prime Minister, Cabinet and the courts", fr: "Le premier ministre, le Cabinet et les tribunaux" },
      { en: "Federal, provincial and municipal governments", fr: "Les gouvernements fédéral, provincial et municipal" },
      { en: "The Senate, the courts and the provinces", fr: "Le Sénat, les tribunaux et les provinces" },
    ],
    answerIndex: 0,
    explanation: {
      en: "Parliament is made up of the Sovereign, the Senate and the elected House of Commons.",
      fr: "Le Parlement se compose du Souverain, du Sénat et de la Chambre des communes élue.",
    },
    source: demoSource,
  },
  {
    id: "q3",
    topicId: "rights",
    difficulty: "easy",
    prompt: {
      en: "Which of these is a responsibility of Canadian citizens?",
      fr: "Laquelle de ces options est une responsabilité des citoyens canadiens ?",
    },
    options: [
      { en: "Paying no federal taxes", fr: "Ne payer aucun impôt fédéral" },
      { en: "Serving on a jury when called", fr: "Servir comme juré lorsqu'on est appelé" },
      { en: "Owning property", fr: "Posséder une propriété" },
      { en: "Joining a political party", fr: "Adhérer à un parti politique" },
    ],
    answerIndex: 1,
    explanation: {
      en: "Jury duty is a responsibility of citizenship, along with obeying the law and voting.",
      fr: "Le service de juré est une responsabilité de la citoyenneté, tout comme respecter la loi et voter.",
    },
    source: demoSource,
  },
  {
    id: "q4",
    topicId: "rights",
    difficulty: "medium",
    prompt: { en: "In what year did the Charter of Rights and Freedoms become part of the Constitution?", fr: "En quelle année la Charte des droits et libertés est-elle devenue partie de la Constitution ?" },
    options: [
      { en: "1867", fr: "1867" },
      { en: "1931", fr: "1931" },
      { en: "1982", fr: "1982" },
      { en: "1999", fr: "1999" },
    ],
    answerIndex: 2,
    explanation: {
      en: "The Charter was entrenched in the Constitution in 1982.",
      fr: "La Charte a été enchâssée dans la Constitution en 1982.",
    },
    source: demoSource,
  },
  {
    id: "q5",
    topicId: "history",
    difficulty: "easy",
    prompt: { en: "In which year was Confederation?", fr: "En quelle année a eu lieu la Confédération ?" },
    options: [
      { en: "1776", fr: "1776" },
      { en: "1812", fr: "1812" },
      { en: "1867", fr: "1867" },
      { en: "1905", fr: "1905" },
    ],
    answerIndex: 2,
    explanation: {
      en: "Confederation took place on July 1, 1867, creating the Dominion of Canada.",
      fr: "La Confédération a eu lieu le 1er juillet 1867, créant le Dominion du Canada.",
    },
    source: demoSource,
  },
  {
    id: "q6",
    topicId: "history",
    difficulty: "medium",
    prompt: { en: "Which three groups of Aboriginal peoples does the Constitution recognize?", fr: "Quels trois groupes de peuples autochtones la Constitution reconnaît-elle ?" },
    options: [
      { en: "First Nations, Métis and Inuit", fr: "Premières Nations, Métis et Inuits" },
      { en: "First Nations, Acadians and Inuit", fr: "Premières Nations, Acadiens et Inuits" },
      { en: "Métis, Inuit and Loyalists", fr: "Métis, Inuits et Loyalistes" },
      { en: "Inuit, Settlers and Métis", fr: "Inuits, colons et Métis" },
    ],
    answerIndex: 0,
    explanation: {
      en: "The Constitution recognizes First Nations, Métis and Inuit peoples.",
      fr: "La Constitution reconnaît les Premières Nations, les Métis et les Inuits.",
    },
    source: demoSource,
  },
  {
    id: "q7",
    topicId: "geography",
    difficulty: "easy",
    prompt: { en: "What is the capital city of Canada?", fr: "Quelle est la capitale du Canada ?" },
    options: [
      { en: "Toronto", fr: "Toronto" },
      { en: "Ottawa", fr: "Ottawa" },
      { en: "Vancouver", fr: "Vancouver" },
      { en: "Québec City", fr: "Ville de Québec" },
    ],
    answerIndex: 1,
    explanation: {
      en: "Ottawa, in Ontario, is the capital of Canada.",
      fr: "Ottawa, en Ontario, est la capitale du Canada.",
    },
    source: demoSource,
  },
  {
    id: "q8",
    topicId: "geography",
    difficulty: "medium",
    prompt: { en: "How many provinces and territories does Canada have?", fr: "Combien de provinces et de territoires le Canada compte-t-il ?" },
    options: [
      { en: "Ten provinces and three territories", fr: "Dix provinces et trois territoires" },
      { en: "Twelve provinces and one territory", fr: "Douze provinces et un territoire" },
      { en: "Nine provinces and four territories", fr: "Neuf provinces et quatre territoires" },
      { en: "Thirteen provinces", fr: "Treize provinces" },
    ],
    answerIndex: 0,
    explanation: {
      en: "Canada has ten provinces and three territories.",
      fr: "Le Canada compte dix provinces et trois territoires.",
    },
    source: demoSource,
  },
  {
    id: "q9",
    topicId: "symbols",
    difficulty: "easy",
    prompt: { en: "When was the current national flag first raised?", fr: "Quand le drapeau national actuel a-t-il été hissé pour la première fois ?" },
    options: [
      { en: "1921", fr: "1921" },
      { en: "1965", fr: "1965" },
      { en: "1982", fr: "1982" },
      { en: "1994", fr: "1994" },
    ],
    answerIndex: 1,
    explanation: {
      en: "The maple leaf flag was raised for the first time in 1965.",
      fr: "Le drapeau à la feuille d'érable a été hissé pour la première fois en 1965.",
    },
    source: demoSource,
  },
  {
    id: "q10",
    topicId: "symbols",
    difficulty: "medium",
    prompt: { en: "Which animal is an official symbol of Canada?", fr: "Quel animal est un symbole officiel du Canada ?" },
    options: [
      { en: "The beaver", fr: "Le castor" },
      { en: "The bald eagle", fr: "Le pygargue à tête blanche" },
      { en: "The wolf", fr: "Le loup" },
      { en: "The salmon", fr: "Le saumon" },
    ],
    answerIndex: 0,
    explanation: {
      en: "The beaver has been an emblem of Canada since the fur trade era.",
      fr: "Le castor est un emblème du Canada depuis l'époque de la traite des fourrures.",
    },
    source: demoSource,
  },
  {
    id: "q11",
    topicId: "economy",
    difficulty: "medium",
    prompt: { en: "Which country is Canada's largest trading partner?", fr: "Quel pays est le principal partenaire commercial du Canada ?" },
    options: [
      { en: "The United Kingdom", fr: "Le Royaume-Uni" },
      { en: "France", fr: "La France" },
      { en: "The United States", fr: "Les États-Unis" },
      { en: "Japan", fr: "Le Japon" },
    ],
    answerIndex: 2,
    explanation: {
      en: "The United States is Canada's largest trading partner.",
      fr: "Les États-Unis sont le principal partenaire commercial du Canada.",
    },
    source: demoSource,
  },
  {
    id: "q12",
    topicId: "people",
    difficulty: "easy",
    prompt: { en: "On which date is Remembrance Day observed?", fr: "À quelle date le jour du Souvenir est-il observé ?" },
    options: [
      { en: "July 1", fr: "1er juillet" },
      { en: "November 11", fr: "11 novembre" },
      { en: "December 26", fr: "26 décembre" },
      { en: "May 24", fr: "24 mai" },
    ],
    answerIndex: 1,
    explanation: {
      en: "Remembrance Day is observed on November 11 each year.",
      fr: "Le jour du Souvenir est observé le 11 novembre de chaque année.",
    },
    source: demoSource,
  },
  {
    id: "q13",
    topicId: "government",
    difficulty: "medium",
    prompt: { en: "Who is responsible for education in Canada?", fr: "Qui est responsable de l'éducation au Canada ?" },
    options: [
      { en: "The federal government", fr: "Le gouvernement fédéral" },
      { en: "Provincial and territorial governments", fr: "Les gouvernements provinciaux et territoriaux" },
      { en: "Municipal governments only", fr: "Les municipalités seulement" },
      { en: "The Senate", fr: "Le Sénat" },
    ],
    answerIndex: 1,
    explanation: {
      en: "Education is a provincial and territorial responsibility.",
      fr: "L'éducation relève des provinces et des territoires.",
    },
    source: demoSource,
  },
  {
    id: "q14",
    topicId: "becoming",
    difficulty: "easy",
    prompt: { en: "What does the citizenship knowledge test cover?", fr: "Que couvre l'examen de connaissances pour la citoyenneté ?" },
    options: [
      { en: "Only Canadian sports history", fr: "Seulement l'histoire du sport canadien" },
      { en: "Canada's history, values, institutions, symbols, rights and responsibilities", fr: "L'histoire, les valeurs, les institutions, les symboles, les droits et les responsabilités du Canada" },
      { en: "Provincial tax law", fr: "Le droit fiscal provincial" },
      { en: "French grammar only", fr: "La grammaire française seulement" },
    ],
    answerIndex: 1,
    explanation: {
      en: "The test covers history, values, institutions, symbols, and the rights and responsibilities of citizenship. Confirm current details with IRCC.",
      fr: "L'examen porte sur l'histoire, les valeurs, les institutions, les symboles ainsi que les droits et responsabilités de la citoyenneté. Vérifiez les détails actuels auprès d'IRCC.",
    },
    source: demoSource,
  },
  {
    id: "q15",
    topicId: "rights",
    difficulty: "hard",
    prompt: { en: "Which of these is a fundamental freedom under the Charter?", fr: "Laquelle est une liberté fondamentale garantie par la Charte ?" },
    options: [
      { en: "Freedom of peaceful assembly", fr: "La liberté de réunion pacifique" },
      { en: "Freedom from paying taxes", fr: "La dispense de payer des impôts" },
      { en: "Freedom to ignore court orders", fr: "La liberté d'ignorer les ordonnances judiciaires" },
      { en: "Freedom to hold two citizenships only", fr: "La liberté de détenir uniquement deux citoyennetés" },
    ],
    answerIndex: 0,
    explanation: {
      en: "Freedom of peaceful assembly is one of the fundamental freedoms listed in the Charter.",
      fr: "La liberté de réunion pacifique est l'une des libertés fondamentales énumérées dans la Charte.",
    },
    source: demoSource,
  },
  {
    id: "q16",
    topicId: "history",
    difficulty: "medium",
    prompt: { en: "Who was Canada's first Prime Minister?", fr: "Qui a été le premier premier ministre du Canada ?" },
    options: [
      { en: "Sir Wilfrid Laurier", fr: "Sir Wilfrid Laurier" },
      { en: "Sir John A. Macdonald", fr: "Sir John A. Macdonald" },
      { en: "Sir Robert Borden", fr: "Sir Robert Borden" },
      { en: "Louis Riel", fr: "Louis Riel" },
    ],
    answerIndex: 1,
    explanation: {
      en: "Sir John A. Macdonald became the first Prime Minister in 1867.",
      fr: "Sir John A. Macdonald est devenu le premier premier ministre en 1867.",
    },
    source: demoSource,
  },
  {
    id: "q17",
    topicId: "geography",
    difficulty: "hard",
    prompt: { en: "Which region includes Manitoba, Saskatchewan and Alberta?", fr: "Quelle région comprend le Manitoba, la Saskatchewan et l'Alberta ?" },
    options: [
      { en: "The Atlantic provinces", fr: "Les provinces de l'Atlantique" },
      { en: "Central Canada", fr: "Le Centre du Canada" },
      { en: "The Prairie provinces", fr: "Les provinces des Prairies" },
      { en: "The Northern territories", fr: "Les territoires du Nord" },
    ],
    answerIndex: 2,
    explanation: {
      en: "Manitoba, Saskatchewan and Alberta are the Prairie provinces.",
      fr: "Le Manitoba, la Saskatchewan et l'Alberta sont les provinces des Prairies.",
    },
    source: demoSource,
  },
  {
    id: "q18",
    topicId: "symbols",
    difficulty: "medium",
    prompt: { en: "In what year was 'O Canada' proclaimed the national anthem?", fr: "En quelle année « Ô Canada » a-t-il été proclamé hymne national ?" },
    options: [
      { en: "1939", fr: "1939" },
      { en: "1967", fr: "1967" },
      { en: "1980", fr: "1980" },
      { en: "1991", fr: "1991" },
    ],
    answerIndex: 2,
    explanation: {
      en: "'O Canada' was proclaimed the national anthem in 1980.",
      fr: "« Ô Canada » a été proclamé hymne national en 1980.",
    },
    source: demoSource,
  },
  {
    id: "q19",
    topicId: "economy",
    difficulty: "easy",
    prompt: { en: "Which of these is a major Canadian natural-resource industry?", fr: "Laquelle est une grande industrie canadienne des ressources naturelles ?" },
    options: [
      { en: "Forestry", fr: "La foresterie" },
      { en: "Spice trading", fr: "Le commerce des épices" },
      { en: "Silk weaving", fr: "Le tissage de la soie" },
      { en: "Diamond cutting only", fr: "La taille de diamants seulement" },
    ],
    answerIndex: 0,
    explanation: {
      en: "Forestry, mining, energy and agriculture are major resource industries in Canada.",
      fr: "La foresterie, l'exploitation minière, l'énergie et l'agriculture sont de grandes industries de ressources au Canada.",
    },
    source: demoSource,
  },
  {
    id: "q20",
    topicId: "government",
    difficulty: "hard",
    prompt: { en: "How does a bill become law in Canada?", fr: "Comment un projet de loi devient-il loi au Canada ?" },
    options: [
      { en: "It is signed by the Prime Minister alone", fr: "Il est signé par le premier ministre seul" },
      { en: "It passes both chambers and receives royal assent", fr: "Il est adopté par les deux chambres et reçoit la sanction royale" },
      { en: "It is approved by a national referendum", fr: "Il est approuvé par un référendum national" },
      { en: "It is decided by the Supreme Court", fr: "Il est décidé par la Cour suprême" },
    ],
    answerIndex: 1,
    explanation: {
      en: "A bill must pass the House of Commons and the Senate, then receive royal assent.",
      fr: "Un projet de loi doit être adopté par la Chambre des communes et le Sénat, puis recevoir la sanction royale.",
    },
    source: demoSource,
  },
];

export function questionsForTopic(topicId: string) {
  return QUESTIONS.filter((q) => q.topicId === topicId);
}

export function topicById(id: string) {
  return TOPICS.find((t) => t.id === id);
}

export function questionById(id: string) {
  return QUESTIONS.find((q) => q.id === id);
}

export function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

export const OFFICIAL_LINKS = {
  test: "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/citizenship-test.html",
  guide:
    "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/study-guide.html",
};
