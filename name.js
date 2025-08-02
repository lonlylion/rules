// Sub-Store 脚本使用 async function(raw, ctx) { ... } 结构
// 不要使用 module.exports！

// 🇨🇳 将国家代码转为国旗 emoji
function countryToFlag(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt() + 127397));
}

// 🌏 IP 查询函数，使用 ipapi.co（可替换成其他支持 CORS 的服务）
async function getCountryInfo(host) {
  try {
    const res = await fetch(`https://ipapi.co/${host}/json`);
    const data = await res.json();

    if (data && data.country_name && data.country) {
      return {
        flag: countryToFlag(data.country),
        country: data.country_name,
      };
    }
  } catch (e) {
    console.log(`查询失败: ${host}`);
  }
  return null;
}

// ✅ Sub-Store 入口函数：必须是 async function(raw, { yaml }) {...}
async function main(raw, { yaml }) {
  const proxies = raw.proxies;

  const cache = {};

  for (let node of proxies) {
    const server = node.server;
    if (!server) continue;

    if (cache[server]) {
      node.name = `${cache[server].flag} ${cache[server].country} - ${node.name}`;
      continue;
    }

    const info = await getCountryInfo(server);
    if (info) {
      node.name = `${info.flag} ${info.country} - ${node.name}`;
      cache[server] = info;
    } else {
      node.name = `❓ 未知 - ${node.name}`;
    }
  }

  return yaml.stringify({ ...raw, proxies });
}

// ⚠️ Sub-Store 脚本中，必须直接导出函数
// 而不是 module.exports！
export default main;