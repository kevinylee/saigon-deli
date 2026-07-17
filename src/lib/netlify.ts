import axios from "axios";

const BUILD_HOOK_URL = "https://api.netlify.com/build_hooks/622d646f7dc132426ac0f0ee";

export const triggerRebuild = async (params = {}) => {
    return axios.post(BUILD_HOOK_URL, null, { params: { trigger_branch: "main", ...params } }).catch(err => {
      console.log(err);
      alert(err);
    });
}
