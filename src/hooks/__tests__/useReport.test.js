import { renderHook } from '@testing-library/react';
import { useReport } from '../useReport';
import { describe, it, expect } from 'vitest';

describe('useReport', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useReport());
    expect(result.current).toBeDefined();
  });
});