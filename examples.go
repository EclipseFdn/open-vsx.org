package examples 
 
import (
	"context"
	"encoding/json"
	"fmt"
	"time"
	"log" 
	"os"
	"path/filepath"

	"google.golang.org/genai"
)

func TokensContext() error {
	// [START tokens_context]
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("AIzaSyAYAo5MRPYHkG-nKg-kQyuwQ0sxp_UyIwg"),
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}

	modelInfo, err := client.Models.Get(ctx, "gemini-2.0-flash", &genai.GetModelConfig{})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("input_token_limit=%d\n", modelInfo.InputTokenLimit)
	fmt.Printf("output_token_limit=%d\n", modelInfo.OutputTokenLimit)
	// [END tokens_context_window]
	return err
}

func TokensTextOnly() error {
	// [START tokens_text_only]
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("AIzaSyAYAo5MRPYHkG-nKg-kQyuwQ0sxp_UyIwg"),
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}
	prompt := "The quick brown fox jumps over the lazy dog."

	// Convert prompt to a slice of *genai.Content using the helper.
	contents := []*genai.Content{
		genai.NewContentFromText(prompt, genai.RoleUser),
	}
	countResp, err := client.Models.CountTokens(ctx, "gemini-2.0-flash", contents, nil)
	if err != nil {
		return err
	}
	fmt.Println("total_tokens:", countResp.TotalTokens)

	response, err := client.Models.GenerateContent(ctx, "gemini-2.0-flash", contents, nil)
	if err != nil {
		log.Fatal(err)
	}
	usageMetadata, err := json.MarshalIndent(response.UsageMetadata, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(usageMetadata))
	// [END tokens_text_only]
	return err
}

func TokensChat() error {
	// [START tokens_chat]
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("AIzaSyAYAo5MRPYHkG-nKg-kQyuwQ0sxp_UyIwg"),
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}

	// Initialize chat with some history.
	history := []*genai.Content{
		{Role: genai.RoleUser, Parts: []*genai.Part{{Text: "Hi my name is Bob"}}},
		{Role: genai.RoleModel, Parts: []*genai.Part{{Text: "Hi Bob!"}}},
	}
	chat, err := client.Chats.Create(ctx, "gemini-2.0-flash", nil, history)
	if err != nil {
		log.Fatal(err)
	}

	firstTokenResp, err := client.Models.CountTokens(ctx, "gemini-2.0-flash", chat.History(false), nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(firstTokenResp.TotalTokens)

	resp, err := chat.SendMessage(ctx, genai.Part{
		Text: "In one sentence, explain how a computer works to a young child."},
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%#v\n", resp.UsageMetadata)

	// Append an extra user message and recount.
extra:=
genai.NewContentFromText("Append an extra user message and recount.", genai.RoleUser)
	hist := chat.History(false)
	hist = append(hist, extra)

	secondTokenResp, err := client.Models.CountTokens(ctx, "gemini-2.0-flash", hist, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(secondTokenResp.TotalTokens)
	// [END tokens_chat]

	return nil
}

func TokensMultimodalImageFileApi() error {
	// [START tokens_multimodal_image_file_api]
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("AIzaSyAYAo5MRPYHkG-nKg-kQyuwQ0sxp_UyIwg"),
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}

	file, err := client.Files.UploadFromPath(
		ctx, 
		filepath.Join(getMedia(), "organ.jpg"), 
		&genai.UploadFileConfig{
			MIMEType : "image/jpeg",
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	parts := []*genai.Part{
		genai.NewPartFromText("Tell me about this image"),
		genai.NewPartFromURI(file.URI, file.MIMEType),
	}
	contents := []*genai.Content{
		genai.NewContentFromParts(parts, genai.RoleUser),
	}

	tokenResp, err := client.Models.CountTokens(ctx, "gemini-2.0-flash", contents, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Multimodal image token count:", tokenResp.TotalTokens)

	response, err := client.Models.GenerateContent(ctx, "gemini-2.0-flash", contents, nil)
	if err != nil {
		log.Fatal(err)
	}
	usageMetadata, err := json.MarshalIndent(response.UsageMetadata, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(usageMetadata))
	// [END tokens_multimodal_image_file_api]
	return err
}

func TokensMultimodalVideoAudioFileApi() error {
	// [START tokens_multimodal_video_audio_file_api]
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("AIzaSyAYAo5MRPYHkG-nKg-kQyuwQ0sxp_UyIwg"),
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}

	file, err := client.Files.UploadFromPath(
		ctx, 
		filepath.Join(getMedia(), "Big_Buck_Bunny.mp4"), 
		&genai.UploadFileConfig{
			MIMEType : "video/mp4",
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	// Poll until the video file is completely processed (state becomes ACTIVE).
	for file.State == genai.FileStateUnspecified || file.State != genai.FileStateActive {
		fmt.Println("Processing video...")
		fmt.Println("File state:", file.State)
		time.Sleep(5 * time.Second)

		file, err = client.Files.Get(ctx, file.Name, nil)
		if err != nil {
			log.Fatal(err)
		}
	}

	parts := []*genai.Part{
		genai.NewPartFromText("Tell me about this video"),
		genai.NewPartFromURI(file.URI, file.MIMEType),
	}
	contents := []*genai.Content{
		genai.NewContentFromParts(parts, genai.RoleUser),
	}

	tokenResp, err := client.Models.CountTokens(ctx, "gemini-2.0-flash", contents, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Multimodal video/audio token count:", tokenResp.TotalTokens)
	response, err := client.Models.GenerateContent(ctx, "gemini-2.0-flash", contents, nil)
	if err != nil {
		log.Fatal(err)
	}
	usageMetadata, err := json.MarshalIndent(response.UsageMetadata, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(usageMetadata))
	// [END tokens_multimodal_video_audio_file_api]
	return err
}

func TokensMultimodalPdfFileApi() error {
	// [START tokens_multimodal_pdf_file_api]
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv(" "),
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}

	file, err := client.Files.UploadFromPath(
		ctx, 
		filepath.Join(getMedia(), "test.pdf"), 
		&genai.UploadFileConfig{
			MIMEType : "application/pdf",
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	parts := []*genai.Part{
		genai.NewPartFromText("Give me a summary of this document."),
		genai.NewPartFromURI(file.URI, file.MIMEType),
	}
	contents := []*genai.Content{
		genai.NewContentFromParts(parts, genai.RoleUser),
	}

	tokenResp, err := client.Models.CountTokens(ctx, "gemini-2.0-flash", contents, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Multimodal PDF token count: %d\n", tokenResp.TotalTokens)
	response, err := client.Models.GenerateContent(ctx, "gemini-2.0-flash", contents, nil)
	if err != nil {
		log.Fatal(err)
	}
	usageMetadata, err := json.MarshalIndent(response.UsageMetadata, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(usageMetadata))
	// [END tokens_multimodal_pdf_file_api]
	return err
}

func TokensCachedContent() error {
	// [START tokens_cached_content]
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  os.Getenv("AIzaSyAYAo5MRPYHkG-nKg-kQyuwQ0sxp_UyIwg"),
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}

	file, err := client.Files.UploadFromPath(
		ctx, 
		filepath.Join(getMedia(), "a11.txt"), 
		&genai.UploadFileConfig{
			MIMEType : "text/plain",
		},
	)
	if err != nil {
		log.Fatal(err)
	}
	parts := []*genai.Part{
		genai.NewPartFromText("Here the Apollo 11 transcript:"),
		genai.NewPartFromURI(file.URI, file.MIMEType),
	}
	contents := []*genai.Content{
		genai.NewContentFromParts(parts, genai.RoleUser),
	}

	// Create cached content using a simple slice with text and a file.
	cache, err := client.Caches.Create(ctx, "gemini-1.5-flash-001", &genai.CreateCachedContentConfig{
		Contents: contents,
	})
	if err != nil {
		log.Fatal(err)
	}

	prompt := "Please give a short summary of this file."
	countResp, err := client.Models.CountTokens(ctx, "gemini-2.0-flash", []*genai.Content{
		genai.NewContentFromText(prompt, genai.RoleUser),
	}, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%d", countResp.TotalTokens)
	response, err := client.Models.GenerateContent(ctx, "gemini-1.5-flash-001", []*genai.Content{
		genai.NewContentFromText(prompt, genai.RoleUser),
	}, &genai.GenerateContentConfig{
		CachedContent: cache.Name,
	})
	if err != nil {
		log.Fatal(err)
	}

	usageMetadata, err := json.MarshalIndent(response.UsageMetadata, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	// Returns `nil` for some reason
	fmt.Println(string(usageMetadata))
	_, err = client.Caches.Delete(ctx, cache.Name, &genai.DeleteCachedContentConfig{})
	// [END tokens_cached_content]
	return err
}
