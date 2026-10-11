import { describe, expect, it } from 'vitest';
import { parseChecklist, serializeChecklist } from './checklistStore';

describe('checklist store', () => {
  it('stores only the ticked lines', () => {
    expect(serializeChecklist({ s2_cl_1: true, s1_cl_0: true, s1_cl_3: false })).toBe('["s1_cl_0","s2_cl_1"]');
  });

  it('reads back what it wrote', () => {
    expect(parseChecklist('["s1_cl_0","s2_cl_1"]')).toEqual({ s1_cl_0: true, s2_cl_1: true });
  });

  it('reads damaged or missing storage as nothing ticked', () => {
    expect(parseChecklist(null)).toEqual({});
    expect(parseChecklist('{not json')).toEqual({});
    expect(parseChecklist('{"s1_cl_0":true}')).toEqual({});
    expect(parseChecklist('["s1_cl_0",7,null]')).toEqual({ s1_cl_0: true });
  });
});
