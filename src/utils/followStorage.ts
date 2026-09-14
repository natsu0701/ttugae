import { currentUserHandle } from "./identity.ts";

const FOLLOW_KEY = "ttugae.follows.v1";
export const FOLLOW_CHANGED_EVENT = "ttugae:follows-changed";

type FollowGraph = {
  following: Record<string, string[]>;
  followers: Record<string, string[]>;
};

const SEED_FOLLOWING: Record<string, string[]> = {
  tteugae: ["sujin", "yarnlover"],
  sujin: ["yarnlover", "heartstitch"],
  yarnlover: ["sujin"],
};

const SEED_FOLLOWERS: Record<string, string[]> = {
  tteugae: ["sujin", "teddyknit"],
  sujin: ["tteugae", "yarnlover", "sunnyknit"],
  yarnlover: ["tteugae", "sujin", "socklane"],
  heartstitch: ["sujin"],
};

function emit() {
  window.dispatchEvent(new Event(FOLLOW_CHANGED_EVENT));
}

function emptyGraph(): FollowGraph {
  return { following: { ...SEED_FOLLOWING }, followers: { ...SEED_FOLLOWERS } };
}

function readGraph(): FollowGraph {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY);
    if (!raw) return emptyGraph();
    const parsed = JSON.parse(raw) as FollowGraph;
    return {
      following: parsed.following ?? {},
      followers: parsed.followers ?? {},
    };
  } catch {
    return emptyGraph();
  }
}

function writeGraph(graph: FollowGraph) {
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(graph));
  emit();
}

function unique(list: string[]): string[] {
  return Array.from(new Set(list.filter(Boolean)));
}

export function listFollowing(handle = currentUserHandle()): string[] {
  return unique(readGraph().following[handle] ?? []);
}

export function listFollowers(handle = currentUserHandle()): string[] {
  return unique(readGraph().followers[handle] ?? []);
}

export function isFollowing(targetHandle: string, fromHandle = currentUserHandle()): boolean {
  return listFollowing(fromHandle).includes(targetHandle);
}

export function toggleFollow(targetHandle: string, fromHandle = currentUserHandle()): boolean {
  if (!targetHandle || targetHandle === fromHandle) return false;
  const graph = readGraph();
  const mine = unique(graph.following[fromHandle] ?? []);
  const theirs = unique(graph.followers[targetHandle] ?? []);
  const nextFollow = !mine.includes(targetHandle);
  graph.following[fromHandle] = nextFollow
    ? [...mine, targetHandle]
    : mine.filter((id) => id !== targetHandle);
  graph.followers[targetHandle] = nextFollow
    ? [...theirs, fromHandle]
    : theirs.filter((id) => id !== fromHandle);
  writeGraph(graph);
  return nextFollow;
}
