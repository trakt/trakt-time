import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createConnection } from './createConnection.ts';
import { createSocket } from './createSocket.ts';
import { destroySocket } from './destroySocket.ts';

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('./createSocket.ts', () => ({ createSocket: vi.fn() }));
vi.mock('./destroySocket.ts', () => ({ destroySocket: vi.fn() }));

const makeSocket = () => ({ close: vi.fn() }) as unknown as WebSocket;

describe('createConnection', () => {
  beforeEach(() => {
    vi.mocked(createSocket).mockReset();
    vi.mocked(destroySocket).mockReset();
  });

  it('should close the previous socket when a new token arrives', () => {
    const previous = makeSocket();
    const next = makeSocket();
    vi.mocked(createSocket).mockReturnValue(next);

    const result = createConnection(previous, 'token-2');

    expect(destroySocket).toHaveBeenCalledWith(previous);
    expect(createSocket).toHaveBeenCalledWith('token-2');
    expect(result).toBe(next);
  });

  it('should keep one open socket across several token changes', () => {
    const open = new Set<WebSocket>();
    vi.mocked(createSocket).mockImplementation(() => {
      const socket = makeSocket();
      open.add(socket);
      return socket;
    });
    vi.mocked(destroySocket).mockImplementation((socket) => {
      if (socket) open.delete(socket);
    });

    const socket = ['a', 'b', 'c', 'd'].reduce<WebSocket | Nil>(
      (previous, token) => createConnection(previous, token),
      null,
    );

    expect(open.size).toBe(1);
    expect(open.has(socket as WebSocket)).toBe(true);
  });

  it('should close the previous socket and open none without a token', () => {
    const previous = makeSocket();

    const result = createConnection(previous, null);

    expect(destroySocket).toHaveBeenCalledWith(previous);
    expect(createSocket).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
