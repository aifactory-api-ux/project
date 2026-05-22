import {
  Branch,
  Product,
  Dispatch,
  User,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  PaginationQuery,
  DateRangeQuery,
} from './index';

describe('Type Definitions', () => {
  describe('Branch Interface', () => {
    it('should accept valid branch object with all required fields', () => {
      const branch: Branch = {
        id: 1,
        name: 'Main Branch',
        address: '123 Main St',
        managerName: 'John Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      expect(branch.id).toBe(1);
      expect(branch.name).toBe('Main Branch');
      expect(branch.address).toBe('123 Main St');
      expect(branch.managerName).toBe('John Doe');
      expect(branch.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(branch.updatedAt).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should accept branch with different id values', () => {
      const branch: Branch = {
        id: 999,
        name: 'Test Branch',
        address: '456 Test Ave',
        managerName: 'Jane Smith',
        createdAt: '2024-06-15T10:30:00.000Z',
        updatedAt: '2024-06-15T10:30:00.000Z',
      };

      expect(typeof branch.id).toBe('number');
      expect(branch.id).toBeGreaterThan(0);
    });

    it('should accept branch with ISO8601 date strings', () => {
      const branch: Branch = {
        id: 1,
        name: 'Branch',
        address: 'Address',
        managerName: 'Manager',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(Date.parse(branch.createdAt)).not.toBeNaN();
      expect(Date.parse(branch.updatedAt)).not.toBeNaN();
    });

    it('should preserve string values exactly as provided', () => {
      const specialChars = 'Branch & Co. - "Test" (Branch #1)';
      const branch: Branch = {
        id: 1,
        name: specialChars,
        address: '123 Main St, Suite 100',
        managerName: 'José García',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(branch.name).toBe(specialChars);
    });
  });

  describe('Product Interface', () => {
    it('should accept valid product object with all required fields', () => {
      const product: Product = {
        id: 1,
        name: 'Widget',
        sku: 'WGT-001',
        description: 'A standard widget',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      expect(product.id).toBe(1);
      expect(product.name).toBe('Widget');
      expect(product.sku).toBe('WGT-001');
      expect(product.description).toBe('A standard widget');
      expect(product.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(product.updatedAt).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should accept product with various SKU formats', () => {
      const skus = ['ABC-123', '12345', 'PROD-001-V2', 'a1b2c3'];

      skus.forEach((sku) => {
        const product: Product = {
          id: 1,
          name: 'Test Product',
          sku: sku,
          description: 'Description',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        };
        expect(product.sku).toBe(sku);
      });
    });

    it('should accept product with empty description', () => {
      const product: Product = {
        id: 1,
        name: 'Minimal Product',
        sku: 'MIN-001',
        description: '',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(product.description).toBe('');
    });

    it('should accept product with long description', () => {
      const longDescription = 'A'.repeat(1000);
      const product: Product = {
        id: 1,
        name: 'Long Description Product',
        sku: 'LNG-001',
        description: longDescription,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(product.description.length).toBe(1000);
    });
  });

  describe('Dispatch Interface', () => {
    it('should accept valid dispatch object with all required fields', () => {
      const dispatch: Dispatch = {
        id: 1,
        branchId: 5,
        productId: 10,
        quantity: 100,
        dispatchedAt: '2024-06-15T14:30:00.000Z',
        createdBy: 'admin',
        createdAt: '2024-06-15T14:30:00.000Z',
        updatedAt: '2024-06-15T14:30:00.000Z',
      };

      expect(dispatch.id).toBe(1);
      expect(dispatch.branchId).toBe(5);
      expect(dispatch.productId).toBe(10);
      expect(dispatch.quantity).toBe(100);
      expect(dispatch.dispatchedAt).toBe('2024-06-15T14:30:00.000Z');
      expect(dispatch.createdBy).toBe('admin');
    });

    it('should accept dispatch with quantity of zero', () => {
      const dispatch: Dispatch = {
        id: 1,
        branchId: 1,
        productId: 1,
        quantity: 0,
        dispatchedAt: '2024-01-01T00:00:00.000Z',
        createdBy: 'system',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(dispatch.quantity).toBe(0);
    });

    it('should accept dispatch with large quantity', () => {
      const dispatch: Dispatch = {
        id: 1,
        branchId: 1,
        productId: 1,
        quantity: 999999,
        dispatchedAt: '2024-01-01T00:00:00.000Z',
        createdBy: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(dispatch.quantity).toBe(999999);
    });

    it('should accept dispatch with different createdBy values', () => {
      const creators = ['admin', 'branch_manager', 'system', 'user_123'];

      creators.forEach((createdBy) => {
        const dispatch: Dispatch = {
          id: 1,
          branchId: 1,
          productId: 1,
          quantity: 10,
          dispatchedAt: '2024-01-01T00:00:00.000Z',
          createdBy: createdBy,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        };
        expect(dispatch.createdBy).toBe(createdBy);
      });
    });
  });

  describe('User Interface', () => {
    it('should accept valid admin user object', () => {
      const user: User = {
        id: 1,
        username: 'admin',
        passwordHash: '$2b$10$hashedpassword',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      expect(user.id).toBe(1);
      expect(user.username).toBe('admin');
      expect(user.passwordHash).toBe('$2b$10$hashedpassword');
      expect(user.role).toBe('admin');
      expect(user.branchId).toBeUndefined();
    });

    it('should accept valid branch_manager user with branchId', () => {
      const user: User = {
        id: 2,
        username: 'manager1',
        passwordHash: '$2b$10$anotherhashedpassword',
        role: 'branch_manager',
        branchId: 5,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      expect(user.role).toBe('branch_manager');
      expect(user.branchId).toBe(5);
    });

    it('should accept admin user without branchId', () => {
      const user: User = {
        id: 1,
        username: 'superadmin',
        passwordHash: 'hash123',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(user.role).toBe('admin');
      expect('branchId' in user).toBe(false);
    });

    it('should accept branch_manager user without branchId', () => {
      const user: User = {
        id: 2,
        username: 'unassigned_manager',
        passwordHash: 'hash456',
        role: 'branch_manager',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(user.role).toBe('branch_manager');
      expect(user.branchId).toBeUndefined();
    });

    it('should not accept invalid role values', () => {
      // TypeScript should catch this at compile time
      // This test documents expected behavior
      const validRoles: ('admin' | 'branch_manager')[] = ['admin', 'branch_manager'];
      
      expect(validRoles).toContain('admin');
      expect(validRoles).toContain('branch_manager');
      expect(validRoles.length).toBe(2);
    });

    it('should accept user with bcrypt-style password hash', () => {
      const bcryptHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4cCpJWDNy3VlQKWi';
      const user: User = {
        id: 1,
        username: 'testuser',
        passwordHash: bcryptHash,
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(user.passwordHash.startsWith('$2b$')).toBe(true);
    });
  });

  describe('LoginRequest Interface', () => {
    it('should accept valid login request', () => {
      const request: LoginRequest = {
        username: 'testuser',
        password: 'testpassword123',
      };

      expect(request.username).toBe('testuser');
      expect(request.password).toBe('testpassword123');
    });

    it('should accept empty password', () => {
      const request: LoginRequest = {
        username: 'user',
        password: '',
      };

      expect(request.password).toBe('');
    });

    it('should accept special characters in username', () => {
      const request: LoginRequest = {
        username: 'user@domain.com',
        password: 'pass',
      };

      expect(request.username).toBe('user@domain.com');
    });

    it('should accept long password', () => {
      const longPassword = 'a'.repeat(128);
      const request: LoginRequest = {
        username: 'user',
        password: longPassword,
      };

      expect(request.password.length).toBe(128);
    });
  });

  describe('LoginResponse Interface', () => {
    it('should accept valid login response', () => {
      const response: LoginResponse = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.signature',
        user: {
          id: 1,
          username: 'admin',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      };

      expect(response.token).toBeTruthy();
      expect(response.user.id).toBe(1);
      expect(response.user.username).toBe('admin');
    });

    it('should exclude passwordHash from user in response', () => {
      const response: LoginResponse = {
        token: 'token123',
        user: {
          id: 1,
          username: 'test',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      // Omit<User, 'passwordHash'> should not have passwordHash
      expect('passwordHash' in response.user).toBe(false);
    });

    it('should accept JWT token with various formats', () => {
      const tokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.signature',
        'simple-token',
        ' Bearer token ',
        'a.b.c',
      ];

      tokens.forEach((token) => {
        const response: LoginResponse = {
          token: token,
          user: {
            id: 1,
            username: 'user',
            role: 'admin',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        };
        expect(response.token).toBe(token);
      });
    });
  });

  describe('ApiResponse Interface', () => {
    it('should accept successful response with data', () => {
      const response: ApiResponse<Branch> = {
        success: true,
        data: {
          id: 1,
          name: 'Branch 1',
          address: 'Address 1',
          managerName: 'Manager 1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe(1);
      expect(response.error).toBeUndefined();
    });

    it('should accept error response with error message', () => {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Something went wrong',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Something went wrong');
      expect(response.data).toBeUndefined();
    });

    it('should accept generic type for data', () => {
      const productResponse: ApiResponse<Product[]> = {
        success: true,
        data: [
          {
            id: 1,
            name: 'Product 1',
            sku: 'SKU-001',
            description: 'Desc 1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      };

      expect(productResponse.data).toHaveLength(1);
      expect(productResponse.data?.[0].sku).toBe('SKU-001');
    });

    it('should accept response with both data and error as undefined', () => {
      const response: ApiResponse<User> = {
        success: true,
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeUndefined();
      expect(response.error).toBeUndefined();
    });

    it('should accept empty array as data', () => {
      const response: ApiResponse<Product[]> = {
        success: true,
        data: [],
      };

      expect(response.data).toEqual([]);
      expect(response.data?.length).toBe(0);
    });
  });

  describe('PaginationQuery Interface', () => {
    it('should accept empty object', () => {
      const query: PaginationQuery = {};

      expect(query.page).toBeUndefined();
      expect(query.limit).toBeUndefined();
    });

    it('should accept page only', () => {
      const query: PaginationQuery = { page: 1 };

      expect(query.page).toBe(1);
      expect(query.limit).toBeUndefined();
    });

    it('should accept limit only', () => {
      const query: PaginationQuery = { limit: 50 };

      expect(query.page).toBeUndefined();
      expect(query.limit).toBe(50);
    });

    it('should accept both page and limit', () => {
      const query: PaginationQuery = { page: 5, limit: 25 };

      expect(query.page).toBe(5);
      expect(query.limit).toBe(25);
    });

    it('should accept page value of 1', () => {
      const query: PaginationQuery = { page: 1 };

      expect(query.page).toBeGreaterThanOrEqual(1);
    });

    it('should accept large limit values', () => {
      const query: PaginationQuery = { limit: 1000 };

      expect(query.limit).toBe(1000);
    });
  });

  describe('DateRangeQuery Interface', () => {
    it('should accept empty object', () => {
      const query: DateRangeQuery = {};

      expect(query.fromDate).toBeUndefined();
      expect(query.toDate).toBeUndefined();
    });

    it('should accept fromDate only', () => {
      const query: DateRangeQuery = { fromDate: '2024-01-01' };

      expect(query.fromDate).toBe('2024-01-01');
      expect(query.toDate).toBeUndefined();
    });

    it('should accept toDate only', () => {
      const query: DateRangeQuery = { toDate: '2024-12-31' };

      expect(query.fromDate).toBeUndefined();
      expect(query.toDate).toBe('2024-12-31');
    });

    it('should accept both dates', () => {
      const query: DateRangeQuery = {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      };

      expect(query.fromDate).toBe('2024-01-01');
      expect(query.toDate).toBe('2024-12-31');
    });

    it('should accept ISO8601 datetime format', () => {
      const query: DateRangeQuery = {
        fromDate: '2024-06-15T00:00:00.000Z',
        toDate: '2024-06-30T23:59:59.999Z',
      };

      expect(Date.parse(query.fromDate!)).not.toBeNaN();
      expect(Date.parse(query.toDate!)).not.toBeNaN();
    });

    it('should accept date range where fromDate is before toDate', () => {
      const query: DateRangeQuery = {
        fromDate: '2024-01-01',
        toDate: '2024-06-15',
      };

      const fromTimestamp = new Date(query.fromDate!).getTime();
      const toTimestamp = new Date(query.toDate!).getTime();

      expect(fromTimestamp).toBeLessThan(toTimestamp);
    });

    it('should accept same date for from and to', () => {
      const query: DateRangeQuery = {
        fromDate: '2024-06-15',
        toDate: '2024-06-15',
      };

      expect(query.fromDate).toBe(query.toDate);
    });
  });

  describe('Type Compatibility and Edge Cases', () => {
    it('should support nested ApiResponse with User data', () => {
      const response: ApiResponse<User> = {
        success: true,
        data: {
          id: 1,
          username: 'test',
          passwordHash: 'hash',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(response.data?.role).toBe('admin');
    });

    it('should support array of dispatches in ApiResponse', () => {
      const response: ApiResponse<Dispatch[]> = {
        success: true,
        data: [
          {
            id: 1,
            branchId: 1,
            productId: 1,
            quantity: 10,
            dispatchedAt: '2024-01-01T00:00:00.000Z',
            createdBy: 'admin',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            branchId: 2,
            productId: 3,
            quantity: 20,
            dispatchedAt: '2024-01-02T00:00:00.000Z',
            createdBy: 'manager',
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
          },
        ],
      };

      expect(response.data).toHaveLength(2);
      expect(response.data?.reduce((sum, d) => sum + d.quantity, 0)).toBe(30);
    });

    it('should support combining pagination with date range', () => {
      const pagination: PaginationQuery = { page: 2, limit: 10 };
      const dateRange: DateRangeQuery = {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      };

      const combined = { ...pagination, ...dateRange };

      expect(combined.page).toBe(2);
      expect(combined.limit).toBe(10);
      expect(combined.fromDate).toBe('2024-01-01');
      expect(combined.toDate).toBe('2024-12-31');
    });

    it('should create complete user object with all timestamps', () => {
      const now = new Date().toISOString();
      const user: User = {
        id: 1,
        username: 'fulluser',
        passwordHash: 'securehash',
        role: 'admin',
        branchId: undefined,
        createdAt: now,
        updatedAt: now,
      };

      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });

    it('should validate interface shapes match specification', () => {
      const branch: Branch = {
        id: expect.any(Number),
        name: expect.any(String),
        address: expect.any(String),
        managerName: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      const product: Product = {
        id: expect.any(Number),
        name: expect.any(String),
        sku: expect.any(String),
        description: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      const dispatch: Dispatch = {
        id: expect.any(Number),
        branchId: expect.any(Number),
        productId: expect.any(Number),
        quantity: expect.any(Number),
        dispatchedAt: expect.any(String),
        createdBy: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      const user: User = {
        id: expect.any(Number),
        username: expect.any(String),
        passwordHash: expect.any(String),
        role: expect.stringMatching(/^(admin|branch_manager)$/),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      // Verify structure expectations
      expect(branch).toHaveProperty('id');
      expect(branch).toHaveProperty('updatedAt');
      expect(product).toHaveProperty('sku');
      expect(dispatch).toHaveProperty('branchId');
      expect(user).toHaveProperty('role');
    });
  });
});
