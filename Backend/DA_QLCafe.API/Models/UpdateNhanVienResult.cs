namespace DA_QLCafe.API.Models
{
    public class UpdateNhanVienResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> DeletedShiftsInfo { get; set; } = new List<string>();
    }
}