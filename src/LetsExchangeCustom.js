/**
 * 官方插件范本（2025 终极版）- 整合特定适配器修补逻辑
 * 用法：在 KV pluginModules 里写：
 * "DemoSign": { "url": "local:DemoSign" }      // 本地开发
 * "DemoSign": { "url": "https://xxx/DemoSign.js" } // 线上热更
 */

export const name = 'DemoSign';
export const meta = {
  name,
  deps: [],                 // 依赖其他插件？写这里
  engineVersion: 'v2025.0'  // 必须锁死，错版直接报错
};

// 可选：全局初始化（只执行一次，状态会缓存）
export async function init(adapter, env, utils) {
  utils.log('[init] 插件加载成功', { adapter: adapter.name });
  return { tsOffset: 0 }; // 缓存的状态，后续阶段能拿到
}

// 签名阶段（最常用）
export async function sign(bodyStr, secret, prevSign, utils, state) {
  const ts = Date.now() + (state?.tsOffset || 0);
  const nonce = crypto.randomUUID().slice(0, 8);
  const msg = `${ts}${nonce}${bodyStr}`;
  const sig = await hmacSha256(msg, secret);

  utils.log('[sign] 生成签名', { ts, nonce, sigPreview: sig.slice(0, 16) + '...' });
  return { value: sig, version: 'v2.1' };
}

// 请求修补阶段（最常用）
export async function flow(vars, chain, utils, state) {
  
  // =========================================================
  // 1. 通用逻辑：添加防重放头 (原逻辑)
  // =========================================================
  chain.headers['X-Timestamp'] = String(Date.now() + (state?.tsOffset || 0));
  chain.headers['X-Nonce'] = crypto.randomUUID().slice(0, 8);
  utils.log('[flow] 添加防重放头');

  // =========================================================
  // 2. 特殊适配器修补逻辑：注入 affiliate_id (新增逻辑)
  // =========================================================
  const affiliateId = vars.affiliate_id;
  let bodyChanges = {}; // 用于记录 body 的修改

  if (chain.bodyStr && affiliateId != null) {
      let body;
      try {
          body = JSON.parse(chain.bodyStr);
      } catch (e) {
          // 记录错误，但不中断整个 flow 阶段
          utils.log?.(`[${name}] Error parsing chain body for affiliate ID injection: ${e.message}`);
          return { headers: chain.headers }; // 仅返回已修改的 headers
      }

      // 注入字段
      body.affiliate_id = affiliateId;
      bodyChanges.body = body; // 标记 body 已被修改
      utils.log?.(`[${name}] affiliate_id injected into body: ${affiliateId}`);
  } else if (chain.bodyStr && affiliateId == null) {
      // 如果 body 存在但 affiliate_id 为空，则记录跳过信息
      utils.log?.(`[${name}] Skip affiliate_id injection: vars.affiliate_id is null/undefined.`);
  }

  // =========================================================
  // 3. 返回合并结果
  // =========================================================
  
  // 返回所有修改的部分，主程序自动 merge。
  // 注意：这里返回的对象可能包含 { headers: ... } 和 { body: ... }
  return { 
      headers: chain.headers, 
      ...bodyChanges // 展开 body 的修改（如果有）
  };
}

// 响应解析阶段（主程序解析失败时才会触发，真正的“救火”）
export async function parseResponse(data, vars, utils, state) {
  utils.log('[parseResponse] 尝试救火解析');

  try {
    const json = typeof data === 'string' ? JSON.parse(data) : data;
    if (json.data?.amount != null) {
      utils.log('[parseResponse] 成功剥层', { amount: json.data.amount });
      return json.data; // 主程序会继续走默认路径解析
    }
  } catch {}

  // 救不了就回退，让主程序继续尝试
  return data;
}

// 可选：abort、mock、validate 等阶段，需要时再加

// 工具函数（插件私有，随插件热更）
async function hmacSha256(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}
