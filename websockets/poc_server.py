#!/usr/bin/env python

import base64
import hashlib
import mimetools
import socket
import StringIO
import struct
import threading
import time

SERVER_HANDSHAKE_HYBI = """
HTTP/1.1 101 Switching Protocols\r
Upgrade: websocket\r
Connection: Upgrade\r
Sec-WebSocket-Accept: %s\r
"""

GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def encode(buf):
  header = 0x81
  header = struct.pack('>BB', header, len(buf))
  return header + buf
  

def handle(s):
  request_text = s.recv(4096)
  print repr(request_text)
  request_line, headers_alone = request_text.split('\r\n', 1)
  headers = mimetools.Message(StringIO.StringIO(headers_alone))

  accept = base64.b64encode(
    hashlib.sha1(headers['Sec-WebSocket-Key'] + GUID).digest())
  response = SERVER_HANDSHAKE_HYBI % (accept)
  response = response.strip() + '\r\n\r\n'

  s.send(response)
  time.sleep(1)
  s.send(encode('hello'))
  time.sleep(1)
  s.send(encode('world'))
  time.sleep(1)
  s.close()

print "Starting socket server...",
s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('', 9876))
s.listen(1)
print "Done."
while 1:
  t,_ = s.accept()
  threading.Thread(target = handle, args = (t,)).start()






