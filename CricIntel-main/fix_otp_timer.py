with open('frontend/src/pages/Auth/VerifyOTP.jsx', encoding='utf-8') as f:
    content = f.read()

# Replace the timer display expression
# Original: 0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
# New: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}

old_pattern = '0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}'
new_pattern = '{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}'

if old_pattern in content:
    content = content.replace(old_pattern, new_pattern, 1)
    with open('frontend/src/pages/Auth/VerifyOTP.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully replaced timer display')
else:
    print('Pattern not found!')
    # Print context around timeLeft
    idx = content.find('timeLeft < 10')
    if idx >= 0:
        print('Found at:', idx)
        print('Context:', repr(content[idx-10:idx+60]))
