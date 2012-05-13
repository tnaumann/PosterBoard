#!/usr/bin/env python

import base64
import hashlib
import itertools
import mimetools
import Queue
import socket
import StringIO
import struct
import threading
import time

#Basic imports
from ctypes import *
import sys
#Phidget specific imports
from Phidgets.PhidgetException import PhidgetErrorCodes, PhidgetException
from Phidgets.Events.Events import AttachEventArgs, DetachEventArgs, ErrorEventArgs, OutputChangeEventArgs, TagEventArgs
from Phidgets.Devices.RFID import RFID

#RFID card mapping
id = {
    # 'CARD ID': 'USER',
    '2E00E4427C': 'cezeozue',
    '2E00E40EF8': 'mvartak',
}

#Websocket protocol
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

#Create an RFID object
try:
    rfid = RFID()
except RuntimeError as e:
    print "Runtime Exception: %s" % e.details
    print "Exiting...."
    exit(1)
    
#Information Display Function
def displayDeviceInfo():
    print "|------------|----------------------------------|--------------|------------|"
    print "|- Attached -|-              Type              -|- Serial No. -|-  Version -|"
    print "|------------|----------------------------------|--------------|------------|"
    print "|- %8s -|- %30s -|- %10d -|- %8d -|" % (rfid.isAttached(), rfid.getDeviceName(), rfid.getSerialNum(), rfid.getDeviceVersion())
    print "|------------|----------------------------------|--------------|------------|"
    print "Number of outputs: %i -- Antenna Status: %s -- Onboard LED Status: %s" % (rfid.getOutputCount(), rfid.getAntennaOn(), rfid.getLEDOn())
    
#Event Handler Callback Functions
def rfidAttached(e):
    attached = e.device
    print "RFID %i Attached!" % (attached.getSerialNum())

def rfidDetached(e):
    detached = e.device
    print "RFID %i Detached!" % (detached.getSerialNum())

def rfidError(e):
    try:
        source = e.device
        print "RFID %i: Phidget Error %i: %s" % (source.getSerialNum(), e.eCode, e.description)
    except PhidgetException as e:
        print "Phidget Exception %i: %s" % (e.code, e.details)

def rfidOutputChanged(e):
    source = e.device
    print "RFID %i: Output %i State: %s" % (source.getSerialNum(), e.index, e.state) 
    
#Main program
try:
    rfid.setOnAttachHandler(rfidAttached)
    rfid.setOnDetachHandler(rfidDetached)
    rfid.setOnErrorhandler(rfidError)
    rfid.setOnOutputChangeHandler(rfidOutputChanged)
except PhidgetException as e:
    print "Phidget Exception %i: %s" % (e.code, e.details)
    print "Exiting...."
    exit(1)
    
print "Opening phidget object...."
try:
    rfid.openPhidget()
except PhidgetException as e:
    print("Phidget Exception %i: %s" % (e.code, e.details))
    print("Exiting....")
    exit(1)

print "Waiting for attach...."
try:
    rfid.waitForAttach(10000)
except PhidgetException as e:
    print "Phidget Exception %i: %s" % (e.code, e.details)
    try:
        rfid.closePhidget()
    except PhidgetException as e:
        print "Phidget Exception %i: %s" % (e.code, e.details)
        print "Exiting...."
        exit(1)
    print "Exiting...."
    exit(1)
else:
    displayDeviceInfo()

print "Turning on the RFID antenna...."
rfid.setAntennaOn(True)
    
print "Initializing socket server..."
s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('',9876))
s.listen(1)


for i in itertools.count(0):
	print "Waiting for connection %d...." % (i)
	t,_ = s.accept()

	print "Handshaking..."
	#Websocket handshake
	request_text = t.recv(4096)
	request_line, headers_alone = request_text.split('\r\n', 1)
	headers = mimetools.Message(StringIO.StringIO(headers_alone))
	accept = base64.b64encode(
		hashlib.sha1(headers['Sec-WebSocket-Key'] + GUID).digest()) 
	response = SERVER_HANDSHAKE_HYBI % (accept)
	response = response.strip() + '\r\n\r\n'
	t.send(response)

	print "Updating handlers for tag reader..."
	def rfidTagGained(e):
		source = e.device
		rfid.setLEDOn(1)
		print("RFID %i: Tag Read: %s" % (source.getSerialNum(), e.tag))
		t.send(encode(id[e.tag]))
		
	def rfidTagLost(e):
		source = e.device
		rfid.setLEDOn(0)
		print("RFID %i: Tag Lost: %s" % (source.getSerialNum(), e.tag))
		
	try:
		rfid.setOnTagHandler(rfidTagGained)
		rfid.setOnTagLostHandler(rfidTagLost)
	except PhidgetException as e:
		print("Phidget Exception %i: %s" % (e.code, e.details))
		print("Exiting....")
		exit(1)

	print("Press Enter to quit....")

	chr = sys.stdin.read(1)
	t.close()

try:
	lastTag = rfid.getLastTag()
	print("Last Tag: %s" % (lastTag))
except PhidgetException as e:
	print("Phidget Exception %i: %s" % (e.code, e.details))

print("Closing...")

try:
	rfid.closePhidget()
except PhidgetException as e:
	print("Phidget Exception %i: %s" % (e.code, e.details))
	print("Exiting....")
	exit(1)

print("Done.")
