export type ProjectReturnContext = {
  tab: string;
  page: number;
  windowScrollY: number;
  workSectionScrollY: number;
};

export const FEATURED_TAB_KEY = "featured";

export function getWorkSectionScrollElement(): HTMLElement | null {
  const work = document.getElementById("work");
  const body = work?.querySelector(".section-card-body");
  return body instanceof HTMLElement ? body : null;
}

export function captureProjectReturnContext(options: {
  tab: string;
  page?: number;
}): ProjectReturnContext {
  return {
    tab: options.tab,
    page: options.page ?? 0,
    windowScrollY: window.scrollY,
    workSectionScrollY: getWorkSectionScrollElement()?.scrollTop ?? 0,
  };
}

export function restoreProjectReturnContext(context: ProjectReturnContext): void {
  window.scrollTo(0, context.windowScrollY);

  requestAnimationFrame(() => {
    const body = getWorkSectionScrollElement();
    if (body) body.scrollTop = context.workSectionScrollY;
  });
}
