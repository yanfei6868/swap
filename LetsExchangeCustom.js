export const name = 'LetsExchangeCustom';

// 在新方案中，meta对象通常是可选的，或者结构有所不同。
// 如果您的框架要求提供，请根据新框架的规范来定义。
// 为兼容性考虑，暂时保留或移除：
// export const meta = { name, deps: [] }; 

/**
 * 插件执行函数
 * @param {object} context - 包含各种上下文信息的对象
 * @param {object} context.vars - 环境变量/用户变量
 * @param {object} context.chain - 当前正在执行的链（请求/响应）信息
 * @param {object} context.utils - 工具集，如 log
 * @param {object} context.state - 状态管理
 * @returns {object|void} - 返回一个包含修改后字段的对象
 */
export async function flow({ vars, chain, utils, state }) {
    // 检查链体字符串是否存在，如果不存在则直接返回
    if (!chain.bodyStr) return;

    // 尝试解析请求体
    let body;
    try {
        body = JSON.parse(chain.bodyStr);
    } catch (e) {
        utils.log?.(`[${name}] Error parsing chain body: ${e.message}`);
        return;
    }

    // 注入你需要的字段（非空才写）
    // 使用非空判断 `vars.affiliate_id != null`
    if (vars.affiliate_id != null) {
        body.affiliate_id = vars.affiliate_id;
        utils.log?.(`[${name}] affiliate_id injected: ${vars.affiliate_id}`);
    }

    // 返回修改结果
    // 新方案通常要求返回一个包含修改后 chain 字段的对象，例如：
    // { bodyStr: JSON.stringify(body) }
    // 如果您的引擎可以自动处理 body 对象的修改并将其转换回 bodyStr，
    // 则返回 { body }。这里假设新方案支持返回 body 对象。
    
    // **最安全的方式是返回 bodyStr 的修改**
    // return { bodyStr: JSON.stringify(body) }; 
    
    // **如果新方案确实支持直接返回 body 对象 (更方便)**
    return { body };
}
