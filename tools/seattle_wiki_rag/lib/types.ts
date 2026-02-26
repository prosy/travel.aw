export type StoredQueryName = "seattle_sports";

export type StoredQuerySpec = {
  name: StoredQueryName;
  title: "Seattle";
  anchor: string;
};

export type WikiSectionMeta = {
  index: string;
  line: string;
  anchor: string;
  number: string;
  level: string;
  toclevel: number;
};

export type WikiSectionRecord = WikiSectionMeta & {
  heading: string;
  html: string;
  text: string;
  sha256: string;
};

export type SeattleWikiSnapshot = {
  schema: "travel.aw/wiki-snapshot/v1";
  source: "wikipedia";
  apiEndpoint: string;
  title: "Seattle";
  pageid: number;
  oldid: number;
  revisionTimestamp: string;
  fetchedAt: string;
  sections: WikiSectionRecord[];
  sha256: string;
};

export type SearchHit = {
  anchor: string;
  heading: string;
  score: number;
  snippet: string;
};

