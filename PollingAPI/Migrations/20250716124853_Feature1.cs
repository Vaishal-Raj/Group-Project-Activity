using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PollingAPI.Migrations
{
    /// <inheritdoc />
    public partial class Feature1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExtensionCount",
                table: "Polls",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxExtensions",
                table: "Polls",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExtensionCount",
                table: "Polls");

            migrationBuilder.DropColumn(
                name: "MaxExtensions",
                table: "Polls");
        }
    }
}
