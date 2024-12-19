import { register, unregister } from '../../utils/serviceWorkerRegistration';

describe('Service Worker Registration', () => {
  const mockRegistration = {
    installing: null,
    waiting: null,
    active: null,
    addEventListener: jest.fn(),
    unregister: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    // Mock service worker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue(mockRegistration),
        ready: Promise.resolve(mockRegistration),
      },
      configurable: true,
    });

    // Mock window
    Object.defineProperty(window, 'addEventListener', {
      value: jest.fn(),
      configurable: true,
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register service worker when supported', () => {
      register();
      
      // Should add load event listener
      expect(window.addEventListener).toHaveBeenCalledWith(
        'load',
        expect.any(Function)
      );

      // Trigger load event
      const loadCallback = (window.addEventListener as jest.Mock).mock.calls[0][1];
      loadCallback();

      // Should register service worker
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
        expect.stringContaining('/service-worker.js')
      );
    });

    it('should handle service worker updates', async () => {
      register();

      // Trigger load event
      const loadCallback = (window.addEventListener as jest.Mock).mock.calls[0][1];
      loadCallback();

      // Mock registration with installing worker
      const mockInstallingWorker = {
        state: 'installed',
        addEventListener: jest.fn(),
      };

      const updatedRegistration = {
        ...mockRegistration,
        installing: mockInstallingWorker,
      };

      (navigator.serviceWorker.register as jest.Mock).mockResolvedValue(
        updatedRegistration
      );

      // Wait for registration
      await (navigator.serviceWorker.register as jest.Mock)();

      // Should add updatefound listener
      expect(updatedRegistration.addEventListener).toHaveBeenCalledWith(
        'updatefound',
        expect.any(Function)
      );

      // Trigger updatefound
      const updateCallback = updatedRegistration.addEventListener.mock.calls[0][1];
      updateCallback();

      // Should add statechange listener to installing worker
      expect(mockInstallingWorker.addEventListener).toHaveBeenCalledWith(
        'statechange',
        expect.any(Function)
      );

      // Mock navigator.serviceWorker.controller
      Object.defineProperty(navigator.serviceWorker, 'controller', {
        value: {},
        configurable: true,
      });

      // Create spy for window.dispatchEvent
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      // Trigger statechange
      const stateChangeCallback = mockInstallingWorker.addEventListener.mock.calls[0][1];
      stateChangeCallback();

      // Should dispatch update event
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.any(CustomEvent)
      );
    });
  });

  describe('unregister', () => {
    it('should unregister service worker when supported', async () => {
      await unregister();
      expect(mockRegistration.unregister).toHaveBeenCalled();
    });

    it('should handle unregister errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Unregister failed');
      mockRegistration.unregister.mockRejectedValue(error);

      await unregister();
      expect(consoleSpy).toHaveBeenCalledWith(error.message);
    });
  });
});
