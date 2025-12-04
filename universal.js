export const meta = {
  name: 'UniversalVariableFix',
  deps: []
};

export async function init(adapterConfig, env, globalState) {
    return null;
}

export async function flow(vars, chain, utils, state) {
    if (vars.fromNetwork) {
        vars.network_from = vars.fromNetwork;
    }
    if (vars.toNetwork) {
        vars.network_to = vars.toNetwork;
    }
    return null;
}
