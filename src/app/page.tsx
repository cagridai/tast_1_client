"use client";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "react-toastify/dist/ReactToastify.css";

interface Meeting {
  id?: number;
  topic: string;
  date: string;
  start_time: string;
  end_time: string;
  participants?: string[];
}

export default function MeetingOrganizer() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [formData, setFormData] = useState<Meeting>({
    topic: "",
    date: "",
    start_time: "",
    end_time: "",
    participants: [],
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/v1/meetings");
      if (!response.ok) throw new Error("Toplantılar bulunamadı");
      const data = await response.json();
      setMeetings(data);
    } catch (err) {
      toast.error("Toplantılar bulunamadı");
      setError("Toplantılar bulunamadı");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "participants") {
      setFormData({
        ...formData,
        participants: value.split(",").map((p) => p.trim()),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const now = new Date();
    const meetingDate = new Date(`${formData.date}T${formData.start_time}`);
    const endTime = new Date(`${formData.date}T${formData.end_time}`);

    if (
      !formData.topic ||
      !formData.date ||
      !formData.start_time ||
      !formData.end_time
    ) {
      toast.error("Katılımcılar hariç tüm alanların doldurulması zorunludur");
      setError("Katılımcılar hariç tüm alanların doldurulması zorunludur");
      return false;
    }
    if (meetingDate < now) {
      toast.error(
        "Toplantı tarihi ve saati gelecek bir zamanda olmak zorundadır",
      );
      setError("Toplantı tarihi ve saati gelecek bir zamanda olmak zorundadır");
      return false;
    }
    if (endTime <= meetingDate) {
      toast.error("Bitiş saati, başlangıç saatinden sonra olmak zorundadır");
      setError("Bitiş saati, başlangıç saatinden sonra olmak zorundadır");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = editingId
        ? `http://127.0.0.1:5000/api/v1/meetings/${editingId}`
        : "http://127.0.0.1:5000/api/v1/meetings";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok)
        throw new Error("Toplantıyı kayıt ederken bir hata oluştu");
      await fetchMeetings();

      if (editingId) {
        toast("Toplantı başarıyla güncellendi");
      } else {
        toast("Toplantı başarıyla oluşturuldu");
      }

      setFormData({
        topic: "",
        date: "",
        start_time: "",
        end_time: "",
        participants: [],
      });
      setEditingId(null);
    } catch (err) {
      toast("Toplantıyı kayıt ederken bir hata oluştu");
      setError("Toplantıyı kayıt ederken bir hata oluştu");
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setFormData(meeting);
    setEditingId(meeting.id ?? null);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/v1/meetings/${id}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Toplantıyı silerken bir hata oluştu");
      await fetchMeetings();
      toast("Toplantı başarılı bir şekilde silindi");
    } catch (err) {
      toast.error("Toplantıyı silerken bir hata oluştu");
      setError("Toplantıyı silerken bir hata oluştu");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Meeting Organizer</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {editingId ? "Toplantıyı Düzenle" : "Toplantı Oluştur"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="topic">Başlık</Label>
              <Input
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Tarih</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="start_time">Başlangıç Saati</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_time">Bitiş Saati</Label>
              <Input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="participants">
                Katılımcılar (Lütfen katılımcıları aralarında virgül olacak
                şekilde ekleyin)
              </Label>
              <Input
                id="participants"
                name="participants"
                value={formData.participants?.join(", ")} // Listeyi virgülle birleştir
                onChange={handleInputChange}
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit">
              {editingId ? "Toplantıyı Güncelle" : "Toplantı Oluştur"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Başlangıç Saati</TableHead>
                <TableHead>Bitiş Saati</TableHead>
                <TableHead>Katılımcılar</TableHead>
                <TableHead>Eylemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>{meeting.topic}</TableCell>
                  <TableCell>{meeting.date}</TableCell>
                  <TableCell>{meeting.start_time}</TableCell>
                  <TableCell>{meeting.end_time}</TableCell>
                  <TableCell>{meeting.participants?.join(", ")}</TableCell>{" "}
                  {/* Listeyi virgülle birleştir */}
                  <TableCell>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleEdit(meeting)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(meeting.id!)}
                    >
                      Sil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
}
