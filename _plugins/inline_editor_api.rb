require 'webrick'
require 'json'
require 'yaml'
require 'fileutils'

# Start WEBrick in a background thread
Thread.new do
  logger = WEBrick::Log.new(nil, WEBrick::BasicLog::WARN) # Suppress verbose logging
  
  begin
    server = WEBrick::HTTPServer.new(
      Port: 4002,
      Logger: logger,
      AccessLog: []
    )

    # Helper to set nested value in hash/array structure
    def self.set_nested_value(data, path, value)
      tokens = path.scan(/[^.\[\]]+/)
      
      # Check if we should discard the first token (filename prefix)
      if data.is_a?(Array)
        tokens.shift
      elsif data.is_a?(Hash) && !data.key?(tokens.first)
        tokens.shift
      end
      
      current = data
      while tokens.size > 1
        token = tokens.shift
        if tokens.first =~ /\A\d+\z/
          index = tokens.shift.to_i
          if current.is_a?(Hash)
            current[token] ||= []
            current[token][index] ||= {}
            current = current[token][index]
          elsif current.is_a?(Array)
            idx = token.to_i
            current[idx] ||= []
            current[idx][index] ||= {}
            current = current[idx][index]
          end
        else
          if current.is_a?(Array)
            idx = token.to_i
            current[idx] ||= {}
            current = current[idx]
          else
            current[token] ||= {}
            current = current[token]
          end
        end
      end
      
      last_token = tokens.shift
      if current.is_a?(Array)
        current[last_token.to_i] = value
      else
        current[last_token] = value
      end
    end

    server.mount_proc '/api/save' do |req, res|
      res.header['Access-Control-Allow-Origin'] = '*'
      res.header['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
      res.header['Access-Control-Allow-Headers'] = 'Content-Type'
      
      if req.request_method == 'OPTIONS'
        res.status = 200
        next
      end
      
      begin
        data = JSON.parse(req.body)
        edits = data['edits'] || []
        
        # Group edits by file path to optimize read/write
        edits_by_file = edits.group_by { |e| e['file'] }
        
        saved_files = []
        
        edits_by_file.each do |file_path, file_edits|
          full_path = File.expand_path(file_path, Dir.pwd)
          
          # Security check: ensure path is within workspace
          unless full_path.start_with?(Dir.pwd)
            res.status = 403
            res.body = { status: 'error', message: "Forbidden path: #{file_path}" }.to_json
            next
          end
          
          # Load the YAML file
          file_data = YAML.load_file(full_path)
          
          # Apply each edit
          file_edits.each do |edit|
            key = edit['key']
            value = edit['value']
            
            # If the key points to the root of the file
            if key == 'faq' && file_data.is_a?(Array)
              file_data = value
            elsif key == 'events' && file_data.is_a?(Array)
              file_data = value
            else
              set_nested_value(file_data, key, value)
            end
          end
          
          # Write back to file
          File.write(full_path, file_data.to_yaml)
          saved_files << file_path
        end
        
        if saved_files.any?
          # Run git commands to commit and push
          system("git add #{saved_files.join(' ')}")
          current_branch = `git rev-parse --abbrev-ref HEAD`.strip
          
          commit_msg = "CMS Update to #{saved_files.join(', ')}"
          system("git commit -m '#{commit_msg}'")
          
          # Push to origin
          push_success = system("git push origin #{current_branch}")
          
          res.status = 200
          res.body = { 
            status: 'success', 
            message: "Saved #{saved_files.size} file(s) and pushed to GitHub.",
            push_success: push_success,
            branch: current_branch
          }.to_json
        else
          res.status = 200
          res.body = { status: 'success', message: 'No files to save.' }.to_json
        end
        
      rescue => e
        res.status = 500
        res.body = { status: 'error', message: e.message }.to_json
      end
    end

    server.start
  rescue Errno::EADDRINUSE
    # Suppress warning when running concurrent builds or server instances
    puts "[Inline Editor API] Port 4002 already in use; skipping API server setup."
  end
end
