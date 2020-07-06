const mdns = require('multicast-dns')()
const os = require('os')

const records = require('/data/records.json')

mdns.on('query', function (query, rinfo) {
    const response = []
    for (const question of query.questions) {
        if (question.type === 'A' && question.name in records) {
            if (records[question.name] === 'auto') {
                let inter = ""
                for (const adapter of Object.values(os.networkInterfaces())) {
                    for (const interface of adapter) {
                        if (interface.family === "IPv4") {
                            if (getipv4Subnet(interface.address, interface.netmask) === getipv4Subnet(rinfo.address, interface.netmask)) {
                                inter = interface.address
                            }
                        }
                    }
                }
                if (inter !== "") {
                    response.push({
                        name: question.name,
                        type: question.type,
                        ttl: 300,
                        data: inter
                    })
                } else {
                    console.warn("Unable to find valid interface for mDNS request from " + rinfo.address)
                }
            } else {
                response.push({
                    name: question.name,
                    type: question.type,
                    ttl: 300,
                    data: records[question.name]
                })
            }
        }
    }
    if (response.length > 0) {
        console.log("Sent mDNS response to " + rinfo.address)
        mdns.respond(response)
    }
})

function getipv4Subnet(address, netmask) {
    return longToipv4(ipv4Tolong(address) & ipv4Tolong(netmask))
}

function longToipv4(long) {
    a = (long & (0xff << 24)) >>> 24;
    b = (long & (0xff << 16)) >>> 16;
    c = (long & (0xff << 8)) >>> 8;
    d = long & 0xff;
    return [a, b, c, d].join('.')
}

function ipv4Tolong(ip) {
    b = ip.split('.');
    if (b.length === 0 || b.length > 4) throw new Error('Invalid IP')
    for (const byte of b) {
        if (parseInt(byte, 10) === NaN) throw new Error("Invalid byte: #{byte}")
        if (byte < 0 || byte > 255) throw new Error("Invalid byte: #{byte}")
    }

    return ((b[0] || 0) << 24 | (b[1] || 0) << 16 | (b[2] || 0) << 8 | (b[3] || 0)) >>> 0
}