# Rodi-mDNS

This is an easy mDNS responder

To use, simply ensure the file `/data/records.json` exists in the container. That file should be a JSON object, which has domain keys and ip values, or auto.

```json
{
  "test1.local": "192.168.0.5",
  "test2.local": "auto"
}
```

If you put `auto`, the mDNS responder will respond with the IP address of the host.

It is recommended to start this container with the host network. 
