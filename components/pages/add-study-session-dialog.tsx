  "use client"
  import { API_BASE_URL } from "@/lib/api"
  import { useState } from "react"
  import { useAuth } from "@/components/auth/auth-context"


  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"

  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"

  interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
  }

  export function AddStudySessionDialog({
    open,
    onOpenChange,
  }: Props) {
    const { user } = useAuth()
    const [subject, setSubject] = useState("")
    const [topic, setTopic] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [duration, setDuration] = useState("")

    const handleSubmit = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/study-sessions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user?.id,
              subject,
              topic,
              session_date: date,
              session_time: time,
              duration,
            }),
          }
        )

        console.log("Status:", response.status)

        if (!response.ok) {
        const text = await response.text()
        console.log("Server Error:", text)
        throw new Error(text)
        }

        const data = await response.json()

        console.log("Response:", data)

        alert("Study Session Added Successfully")

        onOpenChange(false)

        window.location.reload()
      } catch (error: any) {
    console.error("ERROR:", error)

    alert(error.message)

    console.log(error)
  }
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Study Session</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <Label>Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div>
              <Label>Duration</Label>
              <Input
                placeholder="2 hours"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
            >
              Save Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }