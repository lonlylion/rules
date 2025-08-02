// ⚠️ 可部署于 GitHub 或本地并在 Sub-Store 中调用

// 使用第三方免费 IP API 服务（注意速率限制）
const IP_API_URL = "https://ipapi.co"; // 或用 ip.sb, ipapi.co 等

// 国家代码转国旗 emoji
function countryToFlag(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt() + 127397));
}

async function getCountryInfo(host) {
  try {
    const ip = host; // 默认直接使用 IP/域名
    const res = await fetch(`${IP_API_URL}/${ip}/json`);
    const json = await res.json();

    if (json && json.country_name && json.country) {
      return {
        flag: countryToFlag(json.country),
        country: json.country_name,
      };
    }
  } catch (e) {
    console.log(`❌ 查询失败: ${host}`, e.message);
  }
  return null;
}

// 主入口
module.exports = async (raw, { yaml }) => {
  const proxies = raw.proxies;

  for (let node of proxies) {
    const server = node.server || "";
    const info = await getCountryInfo(server);
    if (info) {
      node.name = `${info.flag} ${info.country} - ${node.name}`;
    } else {
      node.name = `❓ 未知 - ${node.name}`;
    }
  }

  return yaml.stringify({ ...raw, proxies });
};