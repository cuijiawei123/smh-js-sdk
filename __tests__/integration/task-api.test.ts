/**
 * TaskApi 集成测试
 * 验证任务查询接口
 * 使用不存在的 taskId 测试接口可达性
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  createTestClient,
  skipIfNoConfig,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('TaskApi 集成测试', () => {
  let client: SMHClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  describe('queryTask - 查询任务', () => {
    it('查询不存在的任务应返回空结果或错误', async () => {
      try {
        const res = await client.task.queryTask({
          taskIdList: '0',
        });
        // 如果接口返回成功，数据应该为空或表示任务不存在
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        // 不存在的任务可能返回 400/403/404
        expect([400, 403, 404]).toContain(error.response?.status);
      }
    });
  });

  describe('queryLibraryTask - 查询媒体库任务', () => {
    it('查询不存在的媒体库任务应返回空结果或错误', async () => {
      try {
        const res = await client.task.queryLibraryTask({
          taskIdList: '0',
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        // 不存在的任务可能返回 400/403/404
        expect([400, 403, 404]).toContain(error.response?.status);
      }
    });
  });
});
