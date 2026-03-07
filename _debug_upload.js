const { SMHClient } = require('./dist/interceptor/SmhClient');
require('dotenv').config();

(async () => {
  try {
    const client = new SMHClient({ basePath: process.env.SMH_BASE_PATH, timeout: 30000 });
    const tokenRes = await client.token.createToken({
      libraryId: process.env.SMH_LIBRARY_ID,
      librarySecret: process.env.SMH_LIBRARY_SECRET,
      spaceId: process.env.SMH_SPACE_ID,
      userId: process.env.SMH_USER_ID,
      grant: 'admin',
      period: 3600,
    });
    console.log('Token OK');

    const authClient = new SMHClient({
      basePath: process.env.SMH_BASE_PATH,
      libraryId: process.env.SMH_LIBRARY_ID,
      spaceId: process.env.SMH_SPACE_ID,
      accessToken: tokenRes.data.accessToken,
      timeout: 30000,
    });

    // 测试创建目录
    try {
      const dirRes = await authClient.directory.createDirectory({ filePath: '__sdk_test__' });
      console.log('创建目录状态:', dirRes.status);
    } catch(e) {
      console.log('创建目录:', e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
    }

    // 测试直接调用 simpleUploadFile API
    try {
      const content = Buffer.from('test content');
      const res = await authClient.file.simpleUploadFile({
        filePath: '__sdk_test__/debug_test.txt',
        body: content,
      });
      console.log('simpleUploadFile 状态:', res.status);
    } catch(e) {
      console.log('simpleUploadFile 失败:', e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
      if (e.config) {
        console.log('请求 URL:', e.config.url);
        console.log('请求方法:', e.config.method);
      }
    }

    // 测试 Uploader
    try {
      const { Blob } = require('buffer');
      const content2 = Buffer.from('test upload content');
      const blob = new Blob([content2], { type: 'text/plain' });
      const file = Object.assign(blob, { name: 'test.txt', lastModified: Date.now() });
      const uploader = authClient.createUploadTask({ file, filePath: '__sdk_test__/uploader_test.txt' });
      uploader.on('statechange', ({ state }) => {
        console.log('Uploader 状态:', state, uploader.message || '');
      });
      uploader.start();
      await new Promise(r => setTimeout(r, 8000));
    } catch(e) {
      console.log('Uploader 异常:', e.message);
    }
  } catch (e) {
    console.error('整体异常:', e.message);
    if (e.response) console.error('Response:', e.response.status, JSON.stringify(e.response.data));
  }
})();
