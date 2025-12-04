export const meta = {
  name: 'UniversalVariableFix',
  deps: []
};

export async function init(adapterConfig, env, globalState) {
    return { adapter: adapterConfig };
}

export async function flow(vars, chain, utils, state) {
    if (vars.fromNetwork) {
        vars.network_from = vars.fromNetwork;
    }
    if (vars.toNetwork) {
        vars.network_to = vars.toNetwork;
    }
    const affiliateId = state.adapter.mappings?.AFFILIATE_ID || '';
    if (affiliateId) {
        vars.affiliate_id = affiliateId;
    } else {
        vars.affiliate_id = '';
    }
    return null;
}
