from qbittorrent import Client
import subprocess
from requests import ConnectionError


class TorrentManager:

	Torrent_App = 'C:\\Program Files\\qBittorrent\\qbittorrent.exe'

	def __init__(self):
		"""
		Opens qBitTorrent if is is closed and then connects to its Web API and login
		"""
		try:
			self.qb = Client('http://localhost:8080/')

		except ConnectionError:
			subprocess.Popen([self.Torrent_App], shell=True)
			self.qb = Client('http://localhost:8080/')

		self.qb.login('admin', 'adminadmin')

	def download_torrent(self, link):
		"""
		downloads the torrent at the provided link
		"""
		self.qb.download_from_link(link)

	def torrent_count(self):
		"""
		returns the count of the current opened torrent in qBitTorrent
		"""
		return len(self.qb.torrents())

	def close(self):
		"""
		closes qBitTorrent
		"""
		self.qb.shutdown()
