import { describe, expect, it } from 'vitest';
import { toJsonLdScript } from './toJsonLdScript.ts';

describe('toJsonLdScript', () => {
  it('should wrap the data in a JSON-LD script tag', () => {
    expect(toJsonLdScript({ name: 'Severance' })).toBe(
      '<script type="application/ld+json">{"name":"Severance"}</script>',
    );
  });

  it('should escape characters that could close the script tag', () => {
    const script = toJsonLdScript({ name: '</script><script>alert(1)' });

    expect(script).not.toContain('</script><script>');
    expect(script.match(/<\/script>/g)).toHaveLength(1);
    expect(JSON.parse(script.slice(35, -9)).name).toBe(
      '</script><script>alert(1)',
    );
  });

  it('should escape ampersands', () => {
    expect(toJsonLdScript({ name: 'Tom & Jerry' })).toContain('\\u0026');
  });
});
