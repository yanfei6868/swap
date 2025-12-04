export async function flow(vars, chain, utils, state) {
    // 1. 补字段
    if (vars.fromNetwork) vars.network_from = vars.fromNetwork;
    if (vars.toNetwork)   vars.network_to   = vars.toNetwork;

    // 2. 重新生成 body
    const fixedBody = { ...JSON.parse(chain.bodyStr), network_from: vars.network_from, network_to: vars.network_to };
    const newBodyStr = JSON.stringify(fixedBody);

    // 3. 写回链（关键！）
    chain.bodyStr = newBodyStr;
    chain.body    = fixedBody;

    // 4. 留痕（可选）
    utils.log?.(`[UniversalFix] body replaced | network_from=${vars.network_from} network_to=${vars.network_to}`);

    // 5. 告诉引擎“我已处理完毕”，不再走默认合并逻辑
    return { body: fixedBody, bodyStr: newBodyStr };
}
