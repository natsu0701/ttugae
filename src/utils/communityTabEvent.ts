export const COMMUNITY_TAB_EVENT = "ttugae:community-tab";
export const LOUNGE_CLOSE_FILTER_EVENT = "ttugae:lounge-close-filter";

export function closeLoungeFilters() {
  window.dispatchEvent(new Event(LOUNGE_CLOSE_FILTER_EVENT));
}
