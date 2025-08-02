function countryToFlag(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt() + 127397));
}

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

export default async function (raw, { yaml }) {
  const proxies = raw.proxies || [];
  const cache = {};

  for (let proxy of proxies) {
    const host = proxy.server;
    if (!host) continue;

    if (cache[host]) {
      proxy.name = `${cache[host].flag} ${cache[host].country} - ${proxy.name}`;
      continue;
    }

    const info = await getCountryInfo(host);
    if (info) {
      proxy.name = `${info.flag} ${info.country} - ${proxy.name}`;
      cache[host] = info;
    } else {
      proxy.name = `❓ 未知 - ${proxy.name}`;
    }
  }

  return yaml.stringify({ ...raw, proxies });
}