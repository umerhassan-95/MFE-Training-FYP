import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installNisum } from './index';

describe('NISUM event system', () => {
  beforeEach(() => {
    delete window.NISUM;
    installNisum();
  });

  it('emits and receives payloads', () => {
    const received: unknown[] = [];
    window.NISUM!.listener('cart:item-added', (data) => received.push(data));

    window.NISUM!.emit('cart:item-added', {
      productId: '123',
      quantity: 1,
      name: 'Stoneware Pourer'
    });

    expect(received).toEqual([
      { productId: '123', quantity: 1, name: 'Stoneware Pourer' }
    ]);
  });

  it('registers and unsubscribes listeners', () => {
    const handler = vi.fn();
    const unsubscribe = window.NISUM!.listener('user:logout', handler);
    window.NISUM!.emit('user:logout');
    unsubscribe();
    window.NISUM!.emit('user:logout');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('dispatches native CustomEvents on window', () => {
    const native = vi.fn();
    window.addEventListener('nisum:notification:show', native);
    window.NISUM!.emit('notification:show', {
      tone: 'success',
      message: 'Added'
    });
    expect(native).toHaveBeenCalled();
  });
});
