const SVELTE_HEAD_MARKER = /^[a-z0-9]+$/;

const isComment = (node: ChildNode): node is Comment =>
  node.nodeType === Node.COMMENT_NODE;

function removeBlock(start: Comment) {
  const nodes: ChildNode[] = [start];
  let depth = 0;
  let current = start.nextSibling;

  while (current) {
    nodes.push(current);
    if (isComment(current)) {
      if (current.data.startsWith('[')) depth += 1;
      if (current.data.startsWith(']')) depth -= 1;
      if (current.data === '' && depth === 0) break;
    }
    current = current.nextSibling;
  }

  nodes.forEach((node) => node.remove());
}

// Svelte drops the marker of each `<svelte:head>` block it hydrates; blocks that
// mount later append new nodes, so markers left after mount are stale copies.
export function removeUnclaimedHeadNodes(head: HTMLHeadElement) {
  const markers = [...head.childNodes].filter((node): node is Comment =>
    isComment(node) && SVELTE_HEAD_MARKER.test(node.data)
  );

  markers.forEach(removeBlock);
}
