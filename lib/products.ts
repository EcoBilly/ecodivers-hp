export type ProductKind = "program" | "package";

export interface DetailBlock {
  type: "image" | "text";
  value: string; // image URL or text content
}

export interface Product {
  id: string;
  kind: ProductKind;
  category: string; // 자유 라벨 (호핑투어 / 해녀체험 / 커플 …)
  title: string;
  enTitle: string; // 프로그램 카드 영문 부제 (패키지는 비워도 됨)
  summary: string; // 카드 한 줄 설명
  priceLabel: string; // "35,000원부터"
  mainImage: string;
  images: string[]; // 추가 이미지
  detailBlocks: DetailBlock[];
  order: number;
  published: boolean;
  featured: boolean; // program: "대표 프로그램" 뱃지
  highlight: boolean; // package: "가장 인기" 강조
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export function emptyProduct(kind: ProductKind, order = 0): ProductInput {
  return {
    kind,
    category: "",
    title: "",
    enTitle: "",
    summary: "",
    priceLabel: "",
    mainImage: "",
    images: [],
    detailBlocks: [],
    order,
    published: false,
    featured: false,
    highlight: false,
  };
}

/** 관리자 페이지의 "기존 카드 불러오기" 시드 데이터 — 현재 홈화면과 동일 */
export const SEED_PRODUCTS: ProductInput[] = [
  {
    kind: "program",
    category: "호핑투어",
    title: "호핑투어",
    enTitle: "HOPPING TOUR",
    summary:
      "보트로 나가 에메랄드빛 앞바다에서 스노클링. 수영을 못해도 구명조끼와 강사가 함께합니다.",
    priceLabel: "35,000원부터",
    mainImage: "/img/reef.jpg",
    images: [],
    detailBlocks: [],
    order: 0,
    published: true,
    featured: true,
    highlight: false,
  },
  {
    kind: "program",
    category: "해녀체험",
    title: "해녀체험",
    enTitle: "HAENYEO",
    summary:
      "제주의 살아있는 문화. 해녀와 함께 물질을 배우고, 직접 잡은 해산물을 맛봅니다.",
    priceLabel: "50,000원부터",
    mainImage: "/img/snorkel-turtle.jpg",
    images: [],
    detailBlocks: [],
    order: 1,
    published: true,
    featured: true,
    highlight: false,
  },
  {
    kind: "program",
    category: "체험다이빙",
    title: "체험다이빙",
    enTitle: "DISCOVERY SCUBA",
    summary:
      "자격증 없이 즐기는 첫 스쿠버. 강사가 1:1로 붙어 수심 5m 아래 세계를 안내합니다.",
    priceLabel: "85,000원부터",
    mainImage: "/img/diver.jpg",
    images: [],
    detailBlocks: [],
    order: 2,
    published: true,
    featured: false,
    highlight: false,
  },
  {
    kind: "program",
    category: "교육",
    title: "교육 · 라이센스",
    enTitle: "COURSE & LICENSE",
    summary:
      "PADI·AIDA 공인 과정. 오픈워터부터 프리다이빙까지 일정에 맞춰 진행합니다.",
    priceLabel: "120,000원부터",
    mainImage: "/img/coral-garden.jpg",
    images: [],
    detailBlocks: [],
    order: 3,
    published: true,
    featured: false,
    highlight: false,
  },
  {
    kind: "program",
    category: "펀다이빙",
    title: "펀다이빙",
    enTitle: "FUN DIVING",
    summary:
      "자격증 보유 다이버를 위한 포인트 가이딩. 관리된 장비와 보트로 편하게.",
    priceLabel: "100,000원부터",
    mainImage: "/img/sandy.jpg",
    images: [],
    detailBlocks: [],
    order: 4,
    published: true,
    featured: false,
    highlight: false,
  },
  {
    kind: "package",
    category: "혼자 여행",
    title: "1인 투어 패키지",
    enTitle: "",
    summary: "체험 + 제주 바다 전망 숙박 1박",
    priceLabel: "112,000",
    mainImage: "/img/turtle-surface.jpg",
    images: [],
    detailBlocks: [],
    order: 0,
    published: true,
    featured: false,
    highlight: false,
  },
  {
    kind: "package",
    category: "가장 인기",
    title: "커플 다이빙 패키지",
    enTitle: "",
    summary: "2인 체험 + 호텔 1박 + 수중 사진 촬영",
    priceLabel: "177,000",
    mainImage: "/img/fish.jpg",
    images: [],
    detailBlocks: [],
    order: 1,
    published: true,
    featured: false,
    highlight: true,
  },
  {
    kind: "package",
    category: "교육 전용",
    title: "올인원 자격증 캠프",
    enTitle: "",
    summary: "오픈워터 교육 + 숙박 3박 + 식사",
    priceLabel: "420,000",
    mainImage: "/img/whale.jpg",
    images: [],
    detailBlocks: [],
    order: 2,
    published: true,
    featured: false,
    highlight: false,
  },
];
